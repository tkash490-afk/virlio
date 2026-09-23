import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { mkdir, readFile } from "fs/promises";
import path from "path";

import { transcribeAudio } from "../../../ai/transcribe";
import { detectClips } from "../../../ai/clip-detector";

const execFileAsync = promisify(execFile);

function logTiming(label: string, start: number) {
  const seconds = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`⏱️ ${label}: ${seconds}s`);
}

export async function GET() {
  return NextResponse.json({
    message: "Virlio API is running 🚀",
  });
}

// Create a video clip with FFmpeg
async function createClip(
  inputPath: string,
  startTime: number,
  duration: number,
  outputPath: string
) {
  await execFileAsync("ffmpeg", [
    "-ss",
    String(startTime),
    "-i",
    inputPath,
    "-t",
    String(duration),
    "-c",
    "copy",
    "-y",
    outputPath,
  ]);
}

// Extract audio for WhisperX
async function extractAudio(
  inputPath: string,
  outputPath: string
) {
  await execFileAsync("ffmpeg", [
    "-i",
    inputPath,
    "-vn",
    "-ac",
    "1",
    "-ar",
    "16000",
    "-c:a",
    "pcm_s16le",
    "-y",
    outputPath,
  ]);
}

export async function POST(request: Request) {
  try {
    const totalStart = Date.now();
    // Read request body
    const body = await request.json();

    const { url } = body;

    // Validate URL
    if (!url) {
      return NextResponse.json(
        {
          success: false,
          message: "No URL was provided.",
        },
        { status: 400 }
      );
    }

    // Temporary processing directory
    const tempDir = path.join(
      process.cwd(),
      "temp"
    );

    await mkdir(tempDir, {
      recursive: true,
    });

    // --------------------------------
    // 1. Get YouTube metadata
    // --------------------------------

    const metadataStart = Date.now();

    const { stdout } = await execFileAsync(
  "node_modules/yt-dlp-exec/bin/yt-dlp.exe",
  [
    url,
    "--dump-single-json",
    "--no-warnings",
    "--js-runtimes",
    "node",
    "--cookies-from-browser",
    "firefox",
  ],
  {
    maxBuffer: 100 * 1024 * 1024,
  }
);

logTiming("YouTube metadata", metadataStart);

    const videoInfo = JSON.parse(
      stdout.toString()
    );

    const videoId = videoInfo.id;

    // --------------------------------
    // 2. Download video
    // --------------------------------

    const outputTemplate = path.join(
      tempDir,
      `${videoId}.%(ext)s`
    );

const downloadStart = Date.now();

    await execFileAsync(
      "node_modules/yt-dlp-exec/bin/yt-dlp.exe",
      [
        url,
        "--no-warnings",
        "--no-playlist",
        "--js-runtimes",
        "node",
        "--cookies-from-browser",
        "firefox",
        "-f",
        "bestvideo+bestaudio/best",
        "--merge-output-format",
        "mp4",
        "-o",
        outputTemplate,
      ]
    );

logTiming("Video download", downloadStart);

    const videoPath = path.join(
      tempDir,
      `${videoId}.mp4`
    );

    // --------------------------------
    // 3. Extract audio
    // --------------------------------

    const audioPath = path.join(
      tempDir,
      `${videoId}.wav`
    );

    const audioStart = Date.now();

await extractAudio(
  videoPath,
  audioPath
);

logTiming("Audio extraction", audioStart);

    // --------------------------------
    // 4. Transcribe with WhisperX
    // --------------------------------

    const transcriptionStart = Date.now();

const transcriptPath =
  await transcribeAudio(
    audioPath,
    tempDir
  );

logTiming(
  "WhisperX transcription",
  transcriptionStart
);

    const transcriptJson =
      await readFile(
        transcriptPath,
        "utf8"
      );

    const transcript =
      JSON.parse(transcriptJson);

    // --------------------------------
    // 5. Detect highlight clips
    // --------------------------------

    const detectionStart = Date.now();

const clipSuggestions =
  detectClips(
    transcript.segments
  );

logTiming(
  "Clip detection",
  detectionStart
);

    // --------------------------------
    // 6. Create actual MP4 clips
    // --------------------------------

    const clips = [];

    for (
      let i = 0;
      i < clipSuggestions.length;
      i++
    ) {
      const suggestion =
        clipSuggestions[i];

      const duration =
        suggestion.end -
        suggestion.start;

      const clipFileName =
        `${videoId}-clip-${i + 1}.mp4`;

      const clipPath =
        path.join(
          tempDir,
          clipFileName
        );

      const clipStart = Date.now();

await createClip(
  videoPath,
  suggestion.start,
  duration,
  clipPath
);

logTiming(
  `Clip ${i + 1} creation`,
  clipStart
);

      clips.push({
        clipNumber: i + 1,
        startTime: suggestion.start,
        endTime: suggestion.end,
        duration,
        reason: suggestion.reason,
        fileName: clipFileName,
        filePath: clipPath,
      });
    }

    // --------------------------------
    // 7. Return results
    // --------------------------------

    logTiming("Total processing", totalStart);
    
    return NextResponse.json({
      success: true,

      message:
        "Video processed and AI clips created successfully!",

      video: {
        title: videoInfo.title,
        channel: videoInfo.uploader,
        duration: videoInfo.duration,
        thumbnail: videoInfo.thumbnail,
        webpageUrl: videoInfo.webpage_url,
        videoId,
      },

      clips,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Video processing failed.",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 400,
      }
    );
  }
}
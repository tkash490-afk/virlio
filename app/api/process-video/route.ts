import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { mkdir } from "fs/promises";
import path from "path";

const execFileAsync = promisify(execFile);

export async function GET() {
  return NextResponse.json({
    message: "Virlio API is running 🚀",
  });
}

// Reusable function for creating a video clip with FFmpeg
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
    "-c:v",
    "libx264",
    "-c:a",
    "aac",
    "-y",
    outputPath,
  ]);
}

export async function POST(request: Request) {
  try {
    // Read the request body
    const body = await request.json();

    // Extract the URL from the request
    const { url } = body;

    // Validate the URL BEFORE using it
    if (!url) {
      return NextResponse.json(
        {
          success: false,
          message: "No URL was provided.",
        },
        { status: 400 }
      );
    }

    // Create a temporary directory for downloaded/processed videos
    const tempDir = path.join(process.cwd(), "temp");

    await mkdir(tempDir, { recursive: true });

    // Ask YouTube for the video's metadata
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
      ]
    );

    // Convert yt-dlp's JSON text into a JavaScript object
    const videoInfo = JSON.parse(stdout.toString());

    // Get the video's unique ID
    const videoId = videoInfo.id;

    // Tell yt-dlp where to save the downloaded video
    const outputTemplate = path.join(
      tempDir,
      `${videoId}.%(ext)s`
    );

    // Download the video
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

    // The downloaded source video should be an MP4
    const videoPath = path.join(tempDir, `${videoId}.mp4`);

    // Create our first test clip:
    // start at 0 seconds and last for 10 seconds
    const clipPath = path.join(
      tempDir,
      `${videoId}-clip-1.mp4`
    );

    await createClip(
      videoPath,
      0,
      10,
      clipPath
    );

    // Return information to the frontend
    return NextResponse.json({
      success: true,
      message: "Video downloaded and test clip created successfully!",
      video: {
        title: videoInfo.title,
        channel: videoInfo.uploader,
        duration: videoInfo.duration,
        thumbnail: videoInfo.thumbnail,
        webpageUrl: videoInfo.webpage_url,
        videoId,
        clip: {
          startTime: 0,
          duration: 10,
        },
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Video processing failed.",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 400 }
    );
  }
}
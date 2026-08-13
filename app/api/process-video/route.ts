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
const tempDir = path.join(process.cwd(), "temp");

await mkdir(tempDir, { recursive: true });
    // Ask YouTube for the video's metadata
    const { stdout } = await execFileAsync(
  "node_modules/yt-dlp-exec/bin/yt-dlp.exe",
  [
    url,
    "--dump-single-json",
    "--no-warnings",
  ]
);

const videoInfo = JSON.parse(stdout.toString());
const videoId = videoInfo.id;

const outputTemplate = path.join(
  tempDir,
  `${videoId}.%(ext)s`
);

await execFileAsync(
  "node_modules/yt-dlp-exec/bin/yt-dlp.exe",
  [
    url,
    "--no-warnings",
    "--no-playlist",
    "-f",
    "best",
    "-o",
    outputTemplate,
  ]
);
    // Return the metadata to the frontend
    return NextResponse.json({
  success: true,
  message: "Video downloaded successfully!",
  video: {
    title: videoInfo.title,
    channel: videoInfo.uploader,
    duration: videoInfo.duration,
    thumbnail: videoInfo.thumbnail,
    webpageUrl: videoInfo.webpage_url,
    videoId,
    tempDir,
  },
});
    
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Invalid request.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}
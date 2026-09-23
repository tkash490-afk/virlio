import { NextResponse } from "next/server";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const fileName = url.searchParams.get("file");

    if (!fileName) {
      return NextResponse.json(
        {
          success: false,
          message: "No clip file was specified.",
        },
        { status: 400 }
      );
    }

    // Prevent path traversal
    const safeFileName = path.basename(fileName);

    if (!safeFileName.endsWith(".mp4")) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid clip file.",
        },
        { status: 400 }
      );
    }

    const clipPath = path.join(
      process.cwd(),
      "temp",
      safeFileName
    );

    const fileStats = await stat(clipPath);
    const fileSize = fileStats.size;

    const range = request.headers.get("range");

    // Browser requested a specific byte range
    if (range) {
      const match = range.match(/bytes=(\d*)-(\d*)/);

      if (!match) {
        return new Response("Invalid Range header", {
          status: 416,
        });
      }

      const start = match[1]
        ? parseInt(match[1], 10)
        : 0;

      const requestedEnd = match[2]
        ? parseInt(match[2], 10)
        : fileSize - 1;

      const end = Math.min(requestedEnd, fileSize - 1);

      if (start >= fileSize || start > end) {
        return new Response(null, {
          status: 416,
          headers: {
            "Content-Range": `bytes */${fileSize}`,
          },
        });
      }

      const contentLength = end - start + 1;

      const stream = createReadStream(clipPath, {
        start,
        end,
      });

      return new Response(stream as unknown as ReadableStream, {
        status: 206,
        headers: {
          "Content-Type": "video/mp4",
          "Content-Length": String(contentLength),
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Cache-Control": "no-store",
        },
      });
    }

    // Normal request without a Range header
    const stream = createReadStream(clipPath);

    return new Response(stream as unknown as ReadableStream, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": String(fileSize),
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Clip could not be found.",
      },
      { status: 404 }
    );
  }
}
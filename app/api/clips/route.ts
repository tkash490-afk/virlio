import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  request: Request
) {
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

    const file = await readFile(clipPath);

    return new Response(file, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": String(file.length),
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
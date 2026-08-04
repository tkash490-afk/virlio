import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    message: "Virlio API is running 🚀",
  });
}
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          message: "No URL was provided.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Video URL received successfully!",
      video: {
        url,
        status: "Pending Processing",
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request.",
      },
      { status: 400 }
    );
  }
}
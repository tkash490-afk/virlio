"use client";

import { useState } from "react";

type Clip = {
  clipNumber: number;
  startTime: number;
  endTime: number;
  duration: number;
  reason: string;
  fileName: string;
};

type VideoInfo = {
  title: string;
  channel: string;
  duration: number;
  thumbnail: string;
  webpageUrl: string;
  videoId: string;
};

type ProcessResult = {
  success: boolean;
  message: string;
  video?: VideoInfo;
  clips?: Clip[];
  error?: string;
};

export default function UrlInput() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);

  async function handleAnalyze() {
    if (!url.trim()) {
      alert("Please paste a YouTube URL.");
      return;
    }

    const isYoutube =
      url.includes("youtube.com/watch?v=") ||
      url.includes("youtu.be/") ||
      url.includes("youtube.com/live/") ||
      url.includes("youtube.com/shorts/");

    if (!isYoutube) {
      alert("Please enter a valid YouTube URL.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/process-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
        }),
      });

      const data: ProcessResult = await response.json();

      setResult(data);
    } catch (error) {
      console.error(error);

      setResult({
        success: false,
        message: "Something went wrong.",
        error: "Could not connect to the video processing API.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">

      {/* URL INPUT */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">
          Paste YouTube URL
        </h2>

        <input
          type="text"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          className="w-full border rounded-lg p-3 mb-4"
        />

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Analyzing Video..." : "Analyze Video"}
        </button>

        {loading && (
          <div className="mt-4">
            <p className="font-medium">
              AI is processing your video...
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Downloading → Transcribing → Detecting highlights → Creating clips
            </p>
          </div>
        )}
      </div>

      {/* ERROR */}
      {result && !result.success && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-red-700">
            Processing failed
          </h2>

          <p className="text-red-600 mt-2">
            {result.error || result.message}
          </p>
        </div>
      )}

      {/* VIDEO INFORMATION */}
      {result?.success && result.video && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex gap-5">
            <img
              src={result.video.thumbnail}
              alt={result.video.title}
              className="w-48 h-28 object-cover rounded-lg"
            />

            <div>
              <h2 className="text-xl font-bold">
                {result.video.title}
              </h2>

              <p className="text-gray-600 mt-2">
                {result.video.channel}
              </p>

              <p className="text-gray-500 text-sm mt-1">
                Duration: {result.video.duration}s
              </p>
            </div>
          </div>
        </div>
      )}

      {/* GENERATED CLIPS */}
      {result?.success && result.clips && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold">
              AI Generated Clips
            </h2>

            <span className="text-gray-500">
              {result.clips.length} clips
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.clips.map((clip) => (
              <div
                key={clip.clipNumber}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >

                {/* VIDEO */}
                <video
                  controls
                  className="w-full aspect-video bg-black"
                  src={`/api/clips?file=${encodeURIComponent(
                    clip.fileName
                  )}`}
                />

                {/* CLIP INFORMATION */}
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">
                      Clip {clip.clipNumber}
                    </h3>

                    <span className="text-sm text-gray-500">
                      {clip.duration.toFixed(1)}s
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mt-2">
                    {clip.startTime.toFixed(1)}s →{" "}
                    {clip.endTime.toFixed(1)}s
                  </p>

                  <p className="text-sm text-gray-700 mt-3">
                    {clip.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
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

type ProcessResult = {
  success: boolean;
  message: string;
  video?: {
    title: string;
    channel: string;
    duration: number;
    thumbnail: string;
    webpageUrl: string;
    videoId: string;
  };
  clips?: Clip[];
  error?: string;
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);

  async function processVideo() {
    if (!url.trim()) {
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
          url: url.trim(),
        }),
      });

      const data = await response.json();

      setResult(data);
    } catch (error) {
      console.error(error);

      setResult({
        success: false,
        message: "Something went wrong while processing the video.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold">
            Virlio
          </h1>

          <p className="text-gray-400 mt-2">
            Turn long videos into short clips with AI.
          </p>
        </div>

        {/* URL input */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">
            Create clips
          </h2>

          <div className="flex gap-3">
            <input
              type="text"
              value={url}
              onChange={(event) =>
                setUrl(event.target.value)
              }
              placeholder="Paste a YouTube URL..."
              className="flex-1 rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 outline-none focus:border-gray-500"
            />

            <button
              onClick={processVideo}
              disabled={loading || !url.trim()}
              className="rounded-xl bg-white text-black px-6 py-3 font-semibold disabled:opacity-50"
            >
              {loading ? "Processing..." : "Create clips"}
            </button>
          </div>
        </div>

        {/* Processing message */}
        {loading && (
          <div className="mt-6 rounded-2xl bg-gray-900 border border-gray-800 p-6">
            <p className="text-gray-300">
              AI is downloading, transcribing and analyzing your video...
            </p>

            <p className="text-gray-500 text-sm mt-2">
              This can take a little while on the local CPU pipeline.
            </p>
          </div>
        )}

        {/* Error */}
        {result && !result.success && (
          <div className="mt-6 rounded-2xl border border-red-900 bg-red-950/40 p-6">
            <h2 className="font-semibold">
              Processing failed
            </h2>

            <p className="text-red-300 mt-2">
              {result.error || result.message}
            </p>
          </div>
        )}

        {/* Video information */}
        {result?.success && result.video && (
          <section className="mt-8">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex gap-5">
                <img
                  src={result.video.thumbnail}
                  alt={result.video.title}
                  className="w-48 h-28 object-cover rounded-xl"
                />

                <div>
                  <h2 className="text-xl font-semibold">
                    {result.video.title}
                  </h2>

                  <p className="text-gray-400 mt-2">
                    {result.video.channel}
                  </p>

                  <p className="text-gray-500 text-sm mt-1">
                    {result.video.duration}s
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Generated clips */}
        {result?.success && result.clips && (
          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                AI Generated Clips
              </h2>

              <span className="text-gray-400">
                {result.clips.length} clips
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {result.clips.map((clip) => (
                <div
                  key={clip.clipNumber}
                  className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden"
                >
                  <video
                    controls
                    className="w-full aspect-video bg-black"
                    src={`/api/clips?file=${encodeURIComponent(
                      clip.fileName
                    )}`}
                  />

                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">
                        Clip {clip.clipNumber}
                      </h3>

                      <span className="text-sm text-gray-400">
                        {clip.duration.toFixed(1)}s
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mt-3">
                      {clip.startTime.toFixed(1)}s →{" "}
                      {clip.endTime.toFixed(1)}s
                    </p>

                    <p className="text-sm text-gray-300 mt-3">
                      {clip.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
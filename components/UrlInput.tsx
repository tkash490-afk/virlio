"use client";

import { useState } from "react";

export default function UrlInput() {
  const [url, setUrl] = useState("");

  function handleAnalyze() {
  if (!url.trim()) {
    alert("Please paste a YouTube URL.");
    return;
  }

  const isYoutube =
    url.includes("youtube.com/watch?v=") ||
    url.includes("youtu.be/");

  if (!isYoutube) {
    alert("Please enter a valid YouTube URL.");
    return;
  }

  alert(`Analyzing:\n${url}`);
}

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">
        Paste YouTube URL
      </h2>

      <input
        type="text"
        placeholder="https://www.youtube.com/watch?v=..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full border rounded-lg p-3 mb-4"
      />

      <button
        onClick={handleAnalyze}
        className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
      >
        Analyze Video
      </button>
    </div>
  );
}
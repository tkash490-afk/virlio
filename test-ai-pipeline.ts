import { readFile } from "fs/promises";
import { transcribeAudio } from "./ai/transcribe";
import { detectClips } from "./ai/clip-detector";

async function main() {
  console.log("1. Starting transcription...");

  const jsonPath = await transcribeAudio(
    "C:\\ffmpeg\\virlio-audio.wav",
    "temp"
  );

  console.log("2. Transcript created:");
  console.log(jsonPath);

  const json = await readFile(jsonPath, "utf8");
  const transcript = JSON.parse(json);

  console.log("3. Transcript loaded.");
  console.log(`Segments: ${transcript.segments.length}`);

  const clips = detectClips(transcript.segments);

  console.log("4. Clip suggestions:");
  console.log(JSON.stringify(clips, null, 2));
}

main().catch(console.error);
import { transcribeAudio } from "./ai/transcribe";

async function main() {
  const jsonPath = await transcribeAudio(
    "C:\\ffmpeg\\virlio-audio.wav",
    "temp"
  );

  console.log("Transcript created:");
  console.log(jsonPath);
}

main().catch(console.error);
import { readFile } from "fs/promises";
import { detectClips } from "./ai/clip-detector";

async function main() {
  const json = await readFile("virlio-audio.json", "utf8");

  const transcript = JSON.parse(json);

  const clips = detectClips(transcript.segments);

  console.log(JSON.stringify(clips, null, 2));
}

main();
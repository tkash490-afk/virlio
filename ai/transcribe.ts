import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);

const WHISPERX_PATH = path.join(
  process.cwd(),
  ".venv-whisper",
  "Scripts",
  "whisperx.exe"
);

export async function transcribeAudio(
  audioPath: string,
  outputDir: string
) {
  await execFileAsync(
    WHISPERX_PATH,
    [
      audioPath,
      "--output_dir",
      outputDir,
      "--output_format",
      "json",
      "--device",
      "cpu",
      "--compute_type",
      "float32",
    ],
    {
      maxBuffer: 50 * 1024 * 1024,
    }
  );

  const jsonPath = path.join(
    outputDir,
    `${path.basename(audioPath, path.extname(audioPath))}.json`
  );

  return jsonPath;
}
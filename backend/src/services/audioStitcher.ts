/**
 * F4: Audio stitching using FFmpeg — concatenates voice clips into a single episode MP3.
 */

import { execFile } from "child_process";
import { writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { resolve, join } from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

/**
 * Concatenate audio clips with pauses between them into a single MP3.
 */
export async function stitchAudio(
  clipPaths: string[],
  outputPath: string,
  pauseMs = 300
): Promise<string> {
  if (clipPaths.length === 0) {
    throw new Error("No audio clips to stitch");
  }

  // Generate a silent pause clip
  const pausePath = resolve(tmpdir(), `pause_${Date.now()}.mp3`);
  await generateSilence(pausePath, pauseMs);

  // Build FFmpeg concat file
  const concatPath = resolve(tmpdir(), `concat_${Date.now()}.txt`);
  const lines: string[] = [];
  for (let i = 0; i < clipPaths.length; i++) {
    lines.push(`file '${clipPaths[i]}'`);
    if (i < clipPaths.length - 1) {
      lines.push(`file '${pausePath}'`);
    }
  }
  writeFileSync(concatPath, lines.join("\n"));

  // Run FFmpeg concat
  try {
    await execFileAsync("ffmpeg", [
      "-y",
      "-f", "concat",
      "-safe", "0",
      "-i", concatPath,
      "-c:a", "libmp3lame",
      "-b:a", "128k",
      "-ar", "44100",
      outputPath,
    ]);
  } finally {
    // Clean up temp files
    try { unlinkSync(concatPath); } catch {}
    try { unlinkSync(pausePath); } catch {}
  }

  return outputPath;
}

/**
 * Generate a silent audio clip using FFmpeg.
 */
async function generateSilence(
  outputPath: string,
  durationMs: number
): Promise<void> {
  const durationS = durationMs / 1000;
  await execFileAsync("ffmpeg", [
    "-y",
    "-f", "lavfi",
    "-i", `anullsrc=r=44100:cl=mono`,
    "-t", String(durationS),
    "-c:a", "libmp3lame",
    "-b:a", "128k",
    outputPath,
  ]);
}

/**
 * Get duration of an audio file in seconds using ffprobe.
 */
export async function getAudioDuration(filePath: string): Promise<number> {
  try {
    const { stdout } = await execFileAsync("ffprobe", [
      "-v", "quiet",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      filePath,
    ]);
    return parseFloat(stdout.trim()) || 0;
  } catch {
    return 0;
  }
}

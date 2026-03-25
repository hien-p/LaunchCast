/**
 * F4: Voice synthesis using ElevenLabs TTS API.
 */

import { ElevenLabsClient } from "elevenlabs";
import { createWriteStream } from "fs";
import { resolve } from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { config } from "../config.js";
import type { ScriptLine } from "../models/types.js";

function getClient(): ElevenLabsClient {
  return new ElevenLabsClient({ apiKey: config.elevenlabsApiKey });
}

/**
 * Synthesize a single script line to an audio file.
 */
export async function synthesizeLine(
  line: ScriptLine,
  outputPath: string
): Promise<string> {
  const client = getClient();
  const voiceId =
    line.speaker === "AERO" ? config.aeroVoiceId : config.novaVoiceId;

  const audio = await client.textToSpeech.convert(voiceId, {
    text: line.text,
    model_id: "eleven_multilingual_v2",
    output_format: "mp3_44100_128",
  });

  // audio is a Readable stream
  const writeStream = createWriteStream(outputPath);
  await pipeline(Readable.from(audio), writeStream);

  return outputPath;
}

/**
 * Synthesize all script lines to individual audio files.
 */
export async function synthesizeScript(
  script: ScriptLine[],
  outputDir: string
): Promise<string[]> {
  const audioPaths: string[] = [];

  for (let i = 0; i < script.length; i++) {
    const line = script[i];
    if (!line.text.trim()) continue;

    const clipPath = resolve(
      outputDir,
      `clip_${String(i).padStart(3, "0")}_${line.speaker.toLowerCase()}.mp3`
    );

    await synthesizeLine(line, clipPath);
    audioPaths.push(clipPath);

    // Small delay between requests to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return audioPaths;
}

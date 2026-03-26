import { execFile } from "child_process";
import { createCanvas } from "canvas";
import { writeFileSync, mkdirSync, unlinkSync, readdirSync } from "fs";
import { resolve, join } from "path";
import { promisify } from "util";
import { tmpdir } from "os";
import type { Episode, ScriptLine } from "../models/types.js";

const execFileAsync = promisify(execFile);

const THEMES = {
  indigo: { bg: "#6c5ce7", accent: "#ffffff", text: "#ffffff", sub: "rgba(255,255,255,0.5)", waveform: "rgba(255,255,255,0.8)" },
  sunset: { bg: "#1c1917", accent: "#f97316", text: "#fef3c7", sub: "rgba(168,162,158,0.7)", waveform: "#f97316" },
  emerald: { bg: "#022c22", accent: "#34d399", text: "#ecfdf5", sub: "rgba(110,231,183,0.5)", waveform: "#34d399" },
  rose: { bg: "#1c1017", accent: "#f43f5e", text: "#ffe4e6", sub: "rgba(253,164,175,0.5)", waveform: "#f43f5e" },
  slate: { bg: "#0f172a", accent: "#e2e8f0", text: "#f8fafc", sub: "rgba(148,163,184,0.5)", waveform: "#e2e8f0" },
} as const;

const SIZES = {
  landscape: { w: 1280, h: 720 },
  square: { w: 1080, h: 1080 },
  portrait: { w: 1080, h: 1920 },
} as const;

export type AudiogramTheme = keyof typeof THEMES;
export type AudiogramSize = keyof typeof SIZES;

export interface AudiogramOptions {
  size: AudiogramSize;
  theme: AudiogramTheme;
  showSpeaker: boolean;
  showTitle: boolean;
  maxDuration: number;
}

export async function generateAudiogram(
  episode: Episode,
  audioPath: string,
  outputPath: string,
  opts: AudiogramOptions,
  onProgress?: (pct: number) => void
): Promise<void> {
  const { w, h } = SIZES[opts.size];
  const colors = THEMES[opts.theme];
  const lines = (episode.script || []).filter((l) => l.text.trim());
  const hasTimestamps = lines.length > 0 && typeof lines[0].start_seconds === "number";

  const totalChars = lines.reduce((s, l) => s + l.text.length, 0);
  const fps = 10;

  const { stdout: durStr } = await execFileAsync("ffprobe", [
    "-v", "quiet", "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1", audioPath,
  ]);
  const audioDuration = parseFloat(durStr.trim());
  const duration = Math.min(audioDuration, opts.maxDuration);
  const totalFrames = Math.ceil(duration * fps);

  const framesDir = resolve(tmpdir(), `audiogram_${Date.now()}`);
  mkdirSync(framesDir, { recursive: true });

  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");

  const titleSize = Math.round(h * 0.03);
  const speakerSize = Math.round(h * 0.025);
  const textSize = Math.round(h * 0.055);
  const padding = Math.round(w * 0.06);

  for (let frame = 0; frame < totalFrames; frame++) {
    const time = frame / fps;

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);

    // Top bar: title left, brand right
    if (opts.showTitle) {
      ctx.font = `bold ${titleSize}px sans-serif`;
      ctx.fillStyle = colors.text;
      ctx.fillText(episode.title, padding, padding + titleSize);

      ctx.font = `bold ${Math.round(titleSize * 0.8)}px sans-serif`;
      ctx.fillStyle = colors.sub;
      const brandText = "LaunchCast";
      const brandW = ctx.measureText(brandText).width;
      ctx.fillText(brandText, w - padding - brandW, padding + titleSize);
    }

    // Find active line
    let activeLine: ScriptLine = lines[0];
    let wordProg = 0;

    if (hasTimestamps) {
      for (const line of lines) {
        const start = line.start_seconds || 0;
        const end = line.end_seconds || 0;
        if (time >= start && time < end) {
          activeLine = line;
          wordProg = (end - start) > 0 ? (time - start) / (end - start) : 0;
          break;
        }
      }
    } else {
      let cumTime = 0;
      for (const line of lines) {
        const lineDur = (line.text.length / totalChars) * audioDuration;
        if (time < cumTime + lineDur) {
          activeLine = line;
          wordProg = (time - cumTime) / lineDur;
          break;
        }
        cumTime += lineDur;
      }
    }

    // Speaker name
    const centerY = h * 0.38;
    let textY = centerY;

    if (opts.showSpeaker && activeLine) {
      const isAero = activeLine.speaker === "AERO";
      ctx.font = `${speakerSize}px sans-serif`;
      ctx.fillStyle = colors.sub;
      ctx.fillText(isAero ? "Aero" : "Nova", padding, textY);
      textY += speakerSize + Math.round(h * 0.02);
    }

    // Transcript text — large, bold, word-by-word color
    if (activeLine) {
      const words = activeLine.text.split(" ");
      const activeIdx = Math.floor(wordProg * words.length);
      const maxWidth = w - padding * 2;

      ctx.font = `bold ${textSize}px sans-serif`;

      let lineX = padding;
      let lineY = textY + textSize;
      const lineHeight = textSize * 1.3;

      for (let wi = 0; wi < words.length; wi++) {
        const word = words[wi] + " ";
        const ww = ctx.measureText(word).width;

        if (lineX + ww > padding + maxWidth) {
          lineX = padding;
          lineY += lineHeight;
        }

        if (wi <= activeIdx) {
          ctx.fillStyle = colors.text;
        } else {
          ctx.fillStyle = colors.sub;
        }

        ctx.fillText(word, lineX, lineY);
        lineX += ww;
      }
    }

    // Waveform at bottom
    const waveY = h * 0.82;
    const waveH = h * 0.12;
    const barCount = 80;
    const barGap = (w - padding * 2) / barCount;
    const barW = barGap * 0.6;
    const progress = time / duration;

    for (let b = 0; b < barCount; b++) {
      const seed = Math.sin(b * 0.7 + time * 3) * 0.5 + 0.5;
      const amp = 0.2 + 0.8 * seed;
      const bH = waveH * amp;
      const bx = padding + b * barGap;

      if (b / barCount < progress) {
        ctx.fillStyle = colors.waveform;
      } else {
        ctx.fillStyle = colors.sub;
      }

      ctx.fillRect(bx, waveY + waveH - bH, barW, bH);
    }

    // Time
    ctx.font = `${Math.round(speakerSize * 0.8)}px monospace`;
    ctx.fillStyle = colors.sub;
    const mm = String(Math.floor(time / 60)).padStart(2, "0");
    const ss = String(Math.floor(time % 60)).padStart(2, "0");
    ctx.fillText(`${mm}:${ss}`, padding, h - padding);

    // Save frame
    const framePath = join(framesDir, `frame_${String(frame).padStart(6, "0")}.png`);
    writeFileSync(framePath, canvas.toBuffer("image/png"));

    if (onProgress) onProgress(Math.round((frame / totalFrames) * 80));
  }

  // FFmpeg: merge frames + audio → MP4
  if (onProgress) onProgress(85);

  await execFileAsync("ffmpeg", [
    "-y",
    "-framerate", String(fps),
    "-i", join(framesDir, "frame_%06d.png"),
    "-ss", "0",
    "-t", String(duration),
    "-i", audioPath,
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "128k",
    "-shortest",
    outputPath,
  ], { timeout: 300000 });

  if (onProgress) onProgress(95);

  // Cleanup frames
  const frameFiles = readdirSync(framesDir);
  for (const f of frameFiles) {
    try { unlinkSync(join(framesDir, f)); } catch { /* ignore */ }
  }
  try { unlinkSync(framesDir); } catch { /* ignore */ }

  if (onProgress) onProgress(100);
}

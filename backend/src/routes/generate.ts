import { Router, type Request, type Response } from "express";
import { resolve } from "path";
import { existsSync } from "fs";
import { generateEpisode } from "../services/pipeline.js";
import { generateAudiogram, type AudiogramSize, type AudiogramTheme } from "../services/audiogramGenerator.js";
import { getEpisode } from "../services/database.js";
import { config } from "../config.js";
import type { SSEEvent } from "../models/types.js";

export const generateRouter = Router();

// Track if generation is in progress
let isGenerating = false;

const PH_URL_PATTERN = /^https?:\/\/(www\.)?producthunt\.com\/posts\/[\w-]+$/;

function validatePhUrl(url: string | undefined): string | null {
  if (!url) return null;
  if (PH_URL_PATTERN.test(url)) return url;
  return null; // Invalid — ignore it
}

/**
 * POST /api/generate — Trigger episode generation (fire-and-forget).
 */
generateRouter.post("/", async (req: Request, res: Response) => {
  if (isGenerating) {
    res.status(409).json({ error: "Episode generation already in progress" });
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  const preferences = req.body?.preferences;
  const phUrl = validatePhUrl(req.body?.ph_url);

  isGenerating = true;
  generateEpisode(preferences, undefined, phUrl || undefined)
    .catch((error) => {
      console.error("Generation failed:", error);
    })
    .finally(() => {
      isGenerating = false;
    });

  res.json({ episode_id: today, status: "generating" });
});

/**
 * GET /api/generate/progress — SSE endpoint for real-time generation progress.
 */
generateRouter.get("/progress", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  // Send initial connected event
  res.write(`data: ${JSON.stringify({ type: "connected", data: {} })}\n\n`);

  // Store SSE writer for this connection
  const writer = (event: SSEEvent) => {
    try {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    } catch {
      // Client disconnected
    }
  };

  sseClients.add(writer);

  req.on("close", () => {
    sseClients.delete(writer);
  });
});

// SSE client management
const sseClients = new Set<(event: SSEEvent) => void>();

export function broadcastSSE(event: SSEEvent): void {
  for (const client of sseClients) {
    client(event);
  }
}

/**
 * POST /api/generate/start — Trigger generation with SSE broadcasting.
 * Accepts optional `ph_url` to crawl a specific Product Hunt post.
 */
generateRouter.post("/start", async (req: Request, res: Response) => {
  if (isGenerating) {
    res.status(409).json({ error: "Episode generation already in progress" });
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  const preferences = req.body?.preferences;
  const phUrl = validatePhUrl(req.body?.ph_url);

  if (req.body?.ph_url && !phUrl) {
    res.status(400).json({ error: "Invalid Product Hunt URL. Use a link like https://producthunt.com/posts/product-name" });
    return;
  }

  isGenerating = true;

  generateEpisode(preferences, broadcastSSE, phUrl || undefined)
    .catch((error) => {
      console.error("Generation failed:", error);
      broadcastSSE({ type: "error", data: { message: String(error) } });
    })
    .finally(() => {
      isGenerating = false;
    });

  res.json({ episode_id: today, status: "generating", mode: phUrl ? "single_product" : "top_launches" });
});

/**
 * POST /api/generate/audiogram — Generate MP4 audiogram for an episode.
 */
generateRouter.post("/audiogram", async (req: Request, res: Response) => {
  const { date, size = "landscape", theme = "indigo", showSpeaker = true, showTitle = true, maxDuration = 60 } = req.body || {};

  if (!date) {
    res.status(400).json({ error: "Missing date parameter" });
    return;
  }

  const episode = await getEpisode(date);
  if (!episode) {
    res.status(404).json({ error: "Episode not found" });
    return;
  }

  const audioPath = resolve(config.episodeOutputDir, `${date}.mp3`);
  if (!existsSync(audioPath)) {
    res.status(404).json({ error: "Episode audio not found" });
    return;
  }

  const outputPath = resolve(config.episodeOutputDir, `${date}_audiogram_${size}_${theme}.mp4`);

  try {
    await generateAudiogram(episode, audioPath, outputPath, {
      size: size as AudiogramSize,
      theme: theme as AudiogramTheme,
      showSpeaker,
      showTitle,
      maxDuration: Math.min(maxDuration, 120),
    });

    res.download(outputPath, `launchcast-${date}-audiogram.mp4`);
  } catch (err) {
    console.error("Audiogram generation failed:", err);
    res.status(500).json({ error: "Audiogram generation failed: " + String(err) });
  }
});

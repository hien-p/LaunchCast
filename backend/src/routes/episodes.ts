import { Router, type Request, type Response } from "express";
import { createReadStream, existsSync, statSync } from "fs";
import { resolve } from "path";
import { config } from "../config.js";
import { getEpisode, getAllEpisodes } from "../services/database.js";

export const episodesRouter = Router();

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function validateDate(date: string, res: Response): boolean {
  if (!DATE_PATTERN.test(date)) {
    res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD." });
    return false;
  }
  return true;
}

episodesRouter.get("/", async (_req: Request, res: Response) => {
  const episodes = await getAllEpisodes();
  const summaries = episodes.map((ep) => ({
    id: ep.id,
    date: ep.date,
    title: ep.title,
    duration_seconds: ep.duration_seconds,
    audio_url: ep.audio_url,
    product_count: ep.products.length,
    created_at: ep.created_at,
  }));
  res.json(summaries);
});

episodesRouter.get("/:date", async (req: Request, res: Response) => {
  const date = req.params.date as string;
  if (!validateDate(date, res)) return;
  const episode = await getEpisode(date);
  if (!episode) {
    res.status(404).json({ error: "Episode not found" });
    return;
  }
  res.json(episode);
});

episodesRouter.get("/:date/audio", (req: Request, res: Response) => {
  const date = req.params.date as string;
  if (!validateDate(date, res)) return;
  const audioPath = resolve(config.episodeOutputDir, `${date}.mp3`);
  if (!existsSync(audioPath)) {
    res.status(404).json({ error: "Audio file not found" });
    return;
  }

  const stat = statSync(audioPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "audio/mpeg",
    });
    createReadStream(audioPath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "audio/mpeg",
      "Accept-Ranges": "bytes",
    });
    createReadStream(audioPath).pipe(res);
  }
});

episodesRouter.get("/:date/products/:name", async (req: Request, res: Response) => {
  const date = req.params.date as string;
  const name = req.params.name as string;
  if (!validateDate(date, res)) return;
  const episode = await getEpisode(date);
  if (!episode) {
    res.status(404).json({ error: "Episode not found" });
    return;
  }

  const product = episode.products.find(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  );
  if (!product) {
    res.status(404).json({ error: "Product not found in this episode" });
    return;
  }

  res.json(product);
});

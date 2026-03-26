/**
 * Episode generation pipeline — orchestrates all stages and emits SSE events.
 */

import { resolve } from "path";
import { mkdirSync } from "fs";
import { config } from "../config.js";
import type { Episode, Product, ScriptLine, SSEEvent } from "../models/types.js";
import { scrapeProductHunt, scrapeSingleProduct, deepScrapeProduct, deepScrapeAllProducts } from "./scraper.js";
import { generateScript } from "./scriptGenerator.js";
import { synthesizeLine, synthesizeScript } from "./voiceSynthesizer.js";
import { stitchAudio, getAudioDuration } from "./audioStitcher.js";
import { saveEpisode } from "./database.js";

export type EventCallback = (event: SSEEvent) => void;

/**
 * Run the full episode generation pipeline, emitting SSE events at each stage.
 */
export async function generateEpisode(
  preferences?: Record<string, unknown>,
  onEvent?: EventCallback,
  phUrl?: string
): Promise<Episode> {
  const today = new Date().toISOString().split("T")[0];
  const emit = onEvent || (() => {});

  let products: Product[];

  if (phUrl) {
    // Single product mode — scrape the specific PH URL
    emit({ type: "scraping_ph", data: { message: `Scraping ${phUrl}...` } });

    try {
      const product = await scrapeSingleProduct(phUrl);
      products = [product];
    } catch (error) {
      emit({ type: "error", data: { message: "Failed to scrape that Product Hunt link", error: String(error) } });
      throw error;
    }
  } else {
    // Default mode — scrape today's top launches
    emit({ type: "scraping_ph", data: { message: "Scanning Product Hunt for today's top launches..." } });

    try {
      products = await scrapeProductHunt();
    } catch (error) {
      emit({ type: "error", data: { message: "Failed to scrape Product Hunt", error: String(error) } });
      throw error;
    }
  }

  if (products.length === 0) {
    emit({ type: "error", data: { message: "No products found" } });
    throw new Error("No products found");
  }

  // Emit each product found
  for (const product of products) {
    emit({ type: "product_found", data: { product: { name: product.name, tagline: product.tagline, ph_url: product.ph_url, upvotes: product.upvotes } } });
  }

  // Stage 2: Deep scrape each product website
  emit({ type: "deep_dive_start", data: { message: `Deep diving into ${products.length} product websites...`, total: products.length } });

  const enrichedProducts: Product[] = [];
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    if (product.website_url) {
      emit({
        type: "scraping_website",
        data: {
          url: product.website_url,
          product_name: product.name,
          index: i + 1,
          total: products.length,
          message: `[${i + 1}/${products.length}] Crawling ${product.name} → ${product.website_url}`,
        },
      });
      try {
        const enriched = await deepScrapeProduct(product);
        enrichedProducts.push(enriched);
        emit({
          type: "website_scraped",
          data: {
            product_name: product.name,
            url: product.website_url,
            has_website_content: !!enriched.website_content,
            features_found: enriched.features.length,
            has_pricing: !!enriched.pricing?.free_tier,
            message: `✓ ${product.name} — ${enriched.features.length} features found${enriched.pricing?.free_tier ? ", free tier available" : ""}`,
          },
        });
      } catch {
        enrichedProducts.push(product);
        emit({
          type: "website_scraped",
          data: {
            product_name: product.name,
            url: product.website_url,
            has_website_content: false,
            features_found: 0,
            message: `✗ ${product.name} — couldn't reach website, using PH data only`,
          },
        });
      }
    } else {
      enrichedProducts.push(product);
      emit({
        type: "website_scraped",
        data: {
          product_name: product.name,
          url: null,
          has_website_content: false,
          features_found: 0,
          message: `— ${product.name} — no website URL, using PH data only`,
        },
      });
    }
  }

  emit({ type: "deep_dive_complete", data: { message: `Deep dive complete — ${enrichedProducts.filter(p => !!p.website_content).length}/${products.length} websites analyzed` } });

  // Stage 3: Generate podcast script
  emit({ type: "generating_script", data: { message: "Writing the episode with Aero & Nova..." } });

  let script: ScriptLine[];
  try {
    script = await generateScript(enrichedProducts, today, preferences);
  } catch (error) {
    emit({ type: "error", data: { message: "Failed to generate script", error: String(error) } });
    throw error;
  }

  emit({ type: "script_ready", data: { line_count: script.length } });

  // Stage 4: Synthesize voices
  const clipsDir = resolve(config.episodeOutputDir, `clips_${today}`);
  mkdirSync(clipsDir, { recursive: true });

  const audioClips: string[] = [];
  for (let i = 0; i < script.length; i++) {
    const line = script[i];
    if (!line.text.trim()) continue;

    emit({
      type: "synthesizing_voice",
      data: {
        speaker: line.speaker,
        line_index: i,
        total_lines: script.length,
        message: `Recording ${line.speaker}...`,
      },
    });

    const clipPath = resolve(clipsDir, `clip_${String(i).padStart(3, "0")}_${line.speaker.toLowerCase()}.mp3`);

    try {
      await synthesizeLine(line, clipPath);
      audioClips.push(clipPath);
    } catch (error) {
      console.error(`Failed to synthesize line ${i} (${line.speaker}):`, error);
      emit({
        type: "voice_error",
        data: {
          line_index: i,
          speaker: line.speaker,
          message: `Failed to record line ${i + 1} — ${String(error)}`,
        },
      });
    }

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 200));
  }

  // Measure each clip duration for accurate transcript sync
  const clipDurations: number[] = [];
  for (const clip of audioClips) {
    clipDurations.push(await getAudioDuration(clip));
  }

  // Map clip durations back to script lines (skip empty lines that had no clip)
  const pauseDuration = 0.3;
  let cumTime = 0;
  let clipIdx = 0;
  for (const line of script) {
    if (!line.text.trim()) continue;
    if (clipIdx < clipDurations.length) {
      (line as any).start_seconds = cumTime;
      (line as any).end_seconds = cumTime + clipDurations[clipIdx];
      cumTime += clipDurations[clipIdx] + pauseDuration;
      clipIdx++;
    }
  }

  // Stage 5: Stitch audio
  emit({ type: "stitching_audio", data: { message: "Mixing the episode...", clip_count: audioClips.length } });

  const episodePath = resolve(config.episodeOutputDir, `${today}.mp3`);
  let duration = 0;

  if (audioClips.length > 0) {
    await stitchAudio(audioClips, episodePath);
    duration = await getAudioDuration(episodePath);
  }

  // Generate episode title from products — short names only
  const topNames = enrichedProducts.slice(0, 3).map((p) => {
    // Use just the product name, strip taglines
    return p.name.split(":")[0].split(" - ")[0].trim();
  });
  const remaining = enrichedProducts.length - topNames.length;
  const titleSuffix = remaining > 0 ? ` +${remaining} more` : "";
  const dateFormatted = new Date(today).toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const title = `${dateFormatted} — ${topNames.join(", ")}${titleSuffix}`;

  // Save episode
  const episode: Episode = {
    id: today,
    date: today,
    title,
    duration_seconds: Math.round(duration),
    audio_url: `/api/episodes/${today}/audio`,
    products: enrichedProducts,
    script,
    created_at: new Date().toISOString(),
  };

  await saveEpisode(episode);

  emit({ type: "complete", data: { episode_id: today, title, duration_seconds: Math.round(duration) } });

  return episode;
}

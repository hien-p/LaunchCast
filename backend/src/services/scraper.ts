/**
 * F1 + F2: Product Hunt scraping and deep product website analysis via Firecrawl.
 */

import FirecrawlApp from "@mendable/firecrawl-js";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { config } from "../config.js";
import { createProduct, type Product } from "../models/types.js";

function getFirecrawl(): FirecrawlApp {
  return new FirecrawlApp({ apiKey: config.firecrawlApiKey });
}

function getCachePath(date: string): string {
  return resolve(config.dataDir, `ph_products_${date}.json`);
}

function loadCachedProducts(date: string): Product[] | null {
  const cachePath = getCachePath(date);
  if (existsSync(cachePath)) {
    try {
      const data = JSON.parse(readFileSync(cachePath, "utf-8"));
      return data as Product[];
    } catch {
      return null; // Corrupt cache — fall back to fresh scrape
    }
  }
  return null;
}

function saveCachedProducts(date: string, products: Product[]): void {
  const cachePath = getCachePath(date);
  writeFileSync(cachePath, JSON.stringify(products, null, 2));
}

/**
 * Scrape today's top Product Hunt launches using Firecrawl Search API.
 */
export async function scrapeProductHunt(): Promise<Product[]> {
  const today = new Date().toISOString().split("T")[0];

  // Check cache first
  const cached = loadCachedProducts(today);
  if (cached) return cached;

  const app = getFirecrawl();

  const searchResult = await app.search(
    "site:producthunt.com/posts today's top launches",
    { limit: 10, scrapeOptions: { formats: ["markdown"] } }
  );

  const products: Product[] = [];

  if (!searchResult?.data) return products;

  for (const item of searchResult.data.slice(0, 10)) {
    const metadata = (item as any).metadata || {};
    const markdown = (item as any).markdown || "";
    const url = (item as any).url || metadata.sourceURL || "";

    if (!url.includes("producthunt.com/posts")) continue;

    let name = (metadata.title || "").split(" - ")[0].split(" | ")[0].trim();
    if (!name) name = extractNameFromUrl(url);

    const tagline = metadata.description || "";
    const upvotes = extractUpvotes(markdown);
    const websiteUrl = extractWebsiteUrl(markdown);
    const imageUrl = metadata.ogImage || metadata["og:image"] || "";

    products.push(
      createProduct({
        name,
        tagline,
        ph_url: url,
        website_url: websiteUrl,
        upvotes,
        ph_description: tagline,
        image_url: imageUrl,
      })
    );
  }

  if (products.length > 0) {
    saveCachedProducts(today, products);
  }

  return products;
}

/**
 * Deep scrape a single product's website for features, pricing, etc.
 */
export async function deepScrapeProduct(product: Product): Promise<Product> {
  if (!product.website_url) return product;

  const app = getFirecrawl();

  try {
    const result = await app.scrapeUrl(product.website_url, {
      formats: ["markdown"],
      onlyMainContent: true,
    }) as any;

    if (result?.markdown) {
      product.website_content = result.markdown.slice(0, 5000);
      product.features = extractFeatures(result.markdown);
      product.pricing = extractPricing(result.markdown);
      product.target_audience = extractAudience(result.markdown);
    }
    const meta = result?.metadata || {};
    if (!product.image_url) {
      product.image_url = meta.ogImage || meta["og:image"] || "";
    }
  } catch {
    // Graceful degradation — use PH blurb only
  }

  return product;
}

/**
 * Deep scrape all products with concurrency limit.
 */
export async function deepScrapeAllProducts(
  products: Product[],
  concurrency = 5
): Promise<Product[]> {
  const results: Product[] = [];
  const queue = [...products];

  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length > 0) {
      const product = queue.shift()!;
      try {
        results.push(await deepScrapeProduct(product));
      } catch {
        results.push(product); // Use original on failure
      }
    }
  });

  await Promise.all(workers);

  // Maintain original order
  const resultMap = new Map(results.map((p) => [p.name, p]));
  return products.map((p) => resultMap.get(p.name) || p);
}

/**
 * Scrape a single Product Hunt post URL directly.
 * User pastes a URL like https://producthunt.com/posts/some-product
 */
export async function scrapeSingleProduct(phUrl: string): Promise<Product> {
  const app = getFirecrawl();

  // Scrape the PH post page
  const result = await app.scrapeUrl(phUrl, {
    formats: ["markdown"],
    onlyMainContent: true,
  }) as any;

  const markdown = result?.markdown || "";
  const metadata = result?.metadata || {};

  let name = (metadata.title || "").split(" - ")[0].split(" | ")[0].trim();
  if (!name) name = extractNameFromUrl(phUrl);

  const tagline = metadata.description || "";
  const upvotes = extractUpvotes(markdown);
  const websiteUrl = extractWebsiteUrl(markdown);

  const imageUrl = metadata.ogImage || metadata["og:image"] || "";

  return createProduct({
    name,
    tagline,
    ph_url: phUrl,
    website_url: websiteUrl,
    upvotes,
    ph_description: tagline || markdown.slice(0, 500),
    image_url: imageUrl,
  });
}

function extractNameFromUrl(url: string): string {
  const match = url.match(/producthunt\.com\/posts\/([^/?#]+)/);
  if (match) {
    return match[1]
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return "Unknown Product";
}

function extractUpvotes(markdown: string): number {
  const patterns = [/(\d+)\s*upvote/i, /▲\s*(\d+)/, /(\d{2,})\s/];
  for (const pattern of patterns) {
    const match = markdown.match(pattern);
    if (match) return parseInt(match[1], 10);
  }
  return 0;
}

function extractWebsiteUrl(markdown: string): string {
  const urls = markdown.match(/https?:\/\/[^\s)]+/g) || [];
  for (const url of urls) {
    if (!url.includes("producthunt.com") && !url.includes("ph-files")) {
      return url.replace(/[.,;)]+$/, "");
    }
  }
  return "";
}

function extractFeatures(markdown: string): string[] {
  const features: string[] = [];
  const lines = markdown.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      /^[-*•]/.test(trimmed) &&
      trimmed.length > 10 &&
      trimmed.length < 200
    ) {
      const feature = trimmed.replace(/^[-*•]\s*/, "").trim();
      if (feature && !feature.startsWith("http")) {
        features.push(feature);
      }
    }
  }
  return features.slice(0, 10);
}

function extractPricing(markdown: string): Product["pricing"] {
  const lower = markdown.toLowerCase();
  const freeTier = [
    "free tier",
    "free plan",
    "free forever",
    "get started free",
    "$0",
  ].some((term) => lower.includes(term));
  return { free_tier: freeTier, plans: [] };
}

function extractAudience(markdown: string): string {
  const keywords = [
    "developers", "designers", "marketers", "founders", "teams",
    "freelancers", "startups", "enterprises", "creators", "engineers",
  ];
  const lower = markdown.toLowerCase();
  return keywords
    .filter((kw) => lower.includes(kw))
    .slice(0, 3)
    .join(", ");
}

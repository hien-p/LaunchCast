import FirecrawlApp from "@mendable/firecrawl-js";
import { config } from "./config.js";

const firecrawl = new FirecrawlApp({ apiKey: config.firecrawlKey });

export interface ScrapeResult {
  url: string;
  title: string;
  content: string;
  success: boolean;
  error?: string;
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  try {
    const result = await firecrawl.scrapeUrl(url, {
      formats: ["markdown"],
      onlyMainContent: true,
    });

    if (!result.success) {
      return { url, title: "", content: "", success: false, error: "Scrape failed" };
    }

    const title = result.metadata?.title || extractTitleFromUrl(url);
    const content = (result.markdown || "").slice(0, 8000);

    return { url, title, content, success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { url, title: "", content: "", success: false, error: msg };
  }
}

export async function scrapeMultiple(urls: string[]): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = [];
  for (const url of urls) {
    results.push(await scrapeUrl(url));
    if (urls.length > 1) await delay(200);
  }
  return results;
}

function extractTitleFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    return hostname;
  } catch {
    return url;
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

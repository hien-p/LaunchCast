import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "./config.js";
import { ScrapeResult } from "./scraper.js";
import { Opportunity } from "./db.js";

const genAI = new GoogleGenerativeAI(config.geminiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function extractOpportunity(
  scrapeResults: ScrapeResult[],
  userMessage: string
): Promise<{ opportunity: Opportunity; summary: string }> {
  const scrapedContext = scrapeResults
    .filter((r) => r.success)
    .map((r) => `## ${r.title}\nURL: ${r.url}\n\n${r.content}`)
    .join("\n\n---\n\n");

  const failedUrls = scrapeResults
    .filter((r) => !r.success)
    .map((r) => `- ${r.url}: ${r.error}`)
    .join("\n");

  const mainUrl = scrapeResults.find((r) => r.success)?.url || "";

  const prompt = `You extract structured data about crypto/tech opportunities from web content.

User message: "${userMessage}"

${scrapedContext ? `Scraped content:\n\n${scrapedContext}` : "No content scraped."}
${failedUrls ? `Failed to scrape:\n${failedUrls}` : ""}

Return a JSON object (no markdown fences) with these exact fields:
{
  "name": "Short name of the opportunity",
  "type": "hackathon" | "grant" | "fellowship" | "bounty",
  "description": "2-3 sentence description covering what it is, prize/funding, and key requirements",
  "organization": "Organizing company/foundation",
  "start_date": "YYYY-MM-DD or null",
  "end_date": "YYYY-MM-DD or null",
  "reward_amount": number or null (USD equivalent),
  "reward_currency": "USD",
  "reward_token": "token symbol or null",
  "blockchains": ["chain names relevant to this opportunity"],
  "tags": ["relevant", "keywords", "max 8"],
  "links": [{"url": "...", "label": "short label"}],
  "notes": "Important details: deadlines, submission requirements, eligibility, format (virtual/in-person)",
  "summary": "Human-readable summary for Telegram reply (3-5 bullet points)"
}

Rules:
- If type is unclear, default to "hackathon"
- Dates must be YYYY-MM-DD format or null
- reward_amount must be a number (no $ sign) or null
- links should include the main URL and any registration/submission links found
- Extract ALL relevant links from the content
- Reply in the same language as the user message for the summary field
- JSON only, no explanation`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  const jsonStr = text.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
  const parsed = JSON.parse(jsonStr);

  const opportunity: Opportunity = {
    name: parsed.name || "Untitled",
    type: parsed.type || "hackathon",
    description: (parsed.description || "").slice(0, 2000),
    status: "discovered",
    organization: parsed.organization || "Unknown",
    website_url: mainUrl,
    start_date: parsed.start_date || null,
    end_date: parsed.end_date || null,
    reward_amount: typeof parsed.reward_amount === "number" ? parsed.reward_amount : null,
    reward_currency: parsed.reward_currency || "USD",
    reward_token: parsed.reward_token || null,
    blockchains: Array.isArray(parsed.blockchains) ? parsed.blockchains : [],
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 8) : [],
    links: Array.isArray(parsed.links) ? parsed.links : [{ url: mainUrl, label: "Website" }],
    notes: (parsed.notes || "").slice(0, 2000),
  };

  const summary = parsed.summary || parsed.description || "Saved.";

  return { opportunity, summary };
}

export async function analyzeMessage(userMessage: string): Promise<string> {
  const prompt = `You are an assistant for a hackathon team tracking crypto opportunities.

User message: "${userMessage}"

Provide a concise, helpful response. If the user is asking about opportunities, hackathons, or grants, give relevant advice. Reply in the same language as the user message.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * F3: Podcast script generation using Google Gemini API.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config.js";
import type { Product, ScriptLine } from "../models/types.js";

const SYSTEM_PROMPT = `You write podcast scripts for LaunchCast, a daily Product Hunt podcast.

Two hosts:
- AERO (SKEPTIC): The technical skeptic. Tears down hype to find real engineering value. Dry, analytical, sharp. Doesn't sugarcoat. Uses analogies from engineering. Gives low ratings when a product is just a wrapper around an API.
- NOVA (OPTIMIST): The product optimist. Sees how new tech empowers creators and reshapes markets. Warm, enthusiastic, forward-looking. Finds the silver lining. Rates higher when a product solves a real user pain.

Rules:
1. Each product gets: quick intro (1-2 lines), deep dive (what PH says vs what the actual website reveals), and hot takes with independent 1-10 ratings from each host.
2. Hosts MUST disagree on at least 2 products per episode. These disagreements should feel natural and opinionated.
3. Tone: casual, opinionated, fun. Like two friends at a coffee shop who happen to be tech experts.
4. Never be bland or generic. Have strong opinions. Use specific details from the product data.
5. Include an episode intro (hosts greet listeners, tease the lineup) and outro (recap favorites, sign off).
6. Keep each product segment to 1-3 minutes of speaking time (~150-400 words per segment).

Output format: Return a JSON array of script lines. Each line has:
- "speaker": "AERO" or "NOVA"
- "text": the spoken dialogue (natural, conversational)
- "product_ref": product name or null for intro/outro
- "type": "intro" | "analysis" | "hot_take" | "rating" | "transition" | "outro"

IMPORTANT: Return ONLY the JSON array, no markdown code blocks, no extra text.`;

const ALLOWED_INTERESTS = [
  "Open Source", "LLMs & AI", "Frontend Tools",
  "Indie SaaS", "Backends & Infra", "UI/UX Design",
];

export async function generateScript(
  products: Product[],
  date: string,
  preferences?: Record<string, unknown>
): Promise<ScriptLine[]> {
  const genAI = new GoogleGenerativeAI(config.geminiApiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT,
  });

  const productsData = products.map((p) => ({
    name: p.name,
    tagline: p.tagline,
    ph_description: p.ph_description,
    website_url: p.website_url,
    upvotes: p.upvotes,
    website_content_summary: p.website_content
      ? p.website_content.slice(0, 2000)
      : "Website not accessible",
    features: p.features.slice(0, 5),
    pricing_free_tier: p.pricing?.free_tier || false,
    target_audience: p.target_audience,
  }));

  let preferencesText = "";
  if (preferences) {
    const rawInterests = preferences.interests as string[] | undefined;
    const interests = rawInterests?.filter((i) => ALLOWED_INTERESTS.includes(i));
    if (interests?.length) {
      preferencesText += `Listener interests: ${interests.join(", ")}. Give extra attention to products in these areas.\n`;
    }
    if (preferences.technical_detail) {
      preferencesText +=
        "Include technical details — the listener is technical.\n";
    }
  }

  const userPrompt = `Today's date: ${date}

Here are today's Product Hunt launches to cover:

${JSON.stringify(productsData, null, 2)}

Generate a complete podcast script covering all ${products.length} products. Remember:
- Start with an intro segment
- Cover each product with analysis and hot takes
- Each host gives an independent rating (1-10)
- End with an outro
- Make it natural and engaging

${preferencesText}`;

  let scriptData: Array<{ speaker: string; text: string; product_ref?: string | null; type?: string }> = [];
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const result = await model.generateContent(userPrompt);
    let rawText = result.response.text().trim();

    if (rawText.startsWith("```")) {
      rawText = rawText.split("\n").slice(1).join("\n");
      if (rawText.endsWith("```")) rawText = rawText.slice(0, -3);
      rawText = rawText.trim();
    }

    try {
      scriptData = JSON.parse(rawText);
      break;
    } catch (parseErr) {
      console.error(`Script JSON parse failed (attempt ${attempt + 1}/${maxRetries}):`, (parseErr as Error).message);
      if (attempt === maxRetries - 1) throw parseErr;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  const scriptLines: ScriptLine[] = scriptData.map((line) => ({
    speaker: (line.speaker === "NOVA" ? "NOVA" : "AERO") as "AERO" | "NOVA",
    text: line.text || "",
    product_ref: line.product_ref || null,
    type: (line.type || "analysis") as ScriptLine["type"],
  }));

  // Extract ratings from script and update products
  extractRatings(scriptLines, products);

  return scriptLines;
}

function extractRatings(
  scriptLines: ScriptLine[],
  products: Product[]
): void {
  for (const line of scriptLines) {
    if (line.type === "rating" && line.product_ref) {
      const ratingMatch = line.text.match(/(\d+)\s*\/?\s*10/);
      if (ratingMatch) {
        const rating = Math.max(1, Math.min(10, parseInt(ratingMatch[1], 10)));
        const product = products.find(
          (p) => p.name.toLowerCase() === line.product_ref?.toLowerCase()
        );
        if (product) {
          if (line.speaker === "AERO") {
            product.aero_rating = rating;
          } else {
            product.nova_rating = rating;
          }
        }
      }
    }
  }
}

import { Telegraf } from "telegraf";
import { config } from "./config.js";
import { scrapeMultiple } from "./scraper.js";
import { extractOpportunity, analyzeMessage } from "./summarizer.js";
import { saveOpportunity, checkDuplicate, getRecentOpportunities } from "./db.js";

const bot = new Telegraf(config.telegramToken);

const URL_REGEX = /https?:\/\/[^\s<>"')\]]+/g;

bot.start((ctx) => {
  ctx.reply(
    "Weminal Hack Bot ready.\n\n" +
      "Send me links (hackathons, grants, bounties) and I'll scrape, extract structured data, and save to the dashboard.\n\n" +
      "Commands:\n" +
      "/recent - Show last 10 opportunities\n" +
      "/help - Show this message"
  );
});

bot.help((ctx) => {
  ctx.reply(
    "Send me:\n" +
      "- One or more URLs → I'll scrape, extract opportunity data, and save to dashboard\n" +
      "- Text with URLs → I'll use your context to enrich extraction\n" +
      "- Plain text → I'll analyze and respond\n\n" +
      "/recent - Show recent opportunities on dashboard"
  );
});

bot.command("recent", async (ctx) => {
  try {
    const items = await getRecentOpportunities(10);

    if (!items || items.length === 0) {
      return ctx.reply("No opportunities saved yet.");
    }

    const list = items
      .map((item: Record<string, unknown>, i: number) => {
        const reward = item.reward_amount ? `$${Number(item.reward_amount).toLocaleString()}` : "—";
        const dates = [item.start_date, item.end_date].filter(Boolean).join(" → ");
        return `${i + 1}. [${String(item.type).toUpperCase()}] ${item.name}\n   ${item.organization} | ${reward} | ${dates || "No dates"}`;
      })
      .join("\n\n");

    ctx.reply(list);
  } catch (err) {
    console.error("Recent command error:", err);
    ctx.reply("Failed to fetch recent opportunities.");
  }
});

bot.on("text", async (ctx) => {
  const message = ctx.message.text;
  const urls = message.match(URL_REGEX) || [];

  try {
    if (urls.length > 0) {
      await ctx.sendChatAction("typing");
      await ctx.reply(`Scraping ${urls.length} link${urls.length > 1 ? "s" : ""}...`);

      const scrapeResults = await scrapeMultiple(urls);
      const successCount = scrapeResults.filter((r) => r.success).length;

      if (successCount === 0) {
        return ctx.reply("Failed to scrape all links. Check if the URLs are accessible.");
      }

      await ctx.sendChatAction("typing");

      const { opportunity, summary } = await extractOpportunity(scrapeResults, message);

      const isDuplicate = await checkDuplicate(opportunity.name, opportunity.website_url);
      if (isDuplicate) {
        await ctx.reply(`⚠ "${opportunity.name}" might already exist in the dashboard.\n\nSaving anyway...`);
      }

      const saved = await saveOpportunity(opportunity);

      const header = `✅ Saved: ${opportunity.name}\n` +
        `Type: ${opportunity.type} | Org: ${opportunity.organization}\n` +
        `Reward: ${opportunity.reward_amount ? "$" + opportunity.reward_amount.toLocaleString() : "—"}\n` +
        `Dates: ${[opportunity.start_date, opportunity.end_date].filter(Boolean).join(" → ") || "—"}\n` +
        `Chains: ${opportunity.blockchains.join(", ") || "—"}\n\n`;

      const reply = truncate(header + summary, 4000);
      await ctx.reply(reply).catch(() => ctx.reply(header + "Saved successfully."));

      console.log(`Saved opportunity: ${opportunity.name} (${saved.id})`);
    } else {
      await ctx.sendChatAction("typing");
      const response = await analyzeMessage(message);
      const reply = truncate(response, 4000);
      await ctx.reply(reply);
    }
  } catch (err) {
    console.error("Message handler error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    ctx.reply(`Error: ${msg}`);
  }
});

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 3) + "...";
}

bot.launch();
console.log("Weminal Hack Bot started");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

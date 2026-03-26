import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../backend/.env") });

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing env: ${key}`);
  return val;
}

export const config = {
  telegramToken: required("TELEGRAM_BOT_TOKEN"),
  supabaseUrl: required("SUPABASE_URL"),
  supabaseServiceKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  firecrawlKey: required("FIRECRAWL_API_KEY"),
  geminiKey: required("GEMINI_API_KEY"),
};

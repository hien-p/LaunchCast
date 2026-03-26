import "dotenv/config";
import { mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_DIR = resolve(__dirname, "..");

export const config = {
  firecrawlApiKey: process.env.FIRECRAWL_API_KEY || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  elevenlabsApiKey: process.env.ELEVENLABS_API_KEY || "",

  aeroVoiceId: process.env.AERO_VOICE_ID || "TX3LPaxmHKxFdv7VOQHJ",
  novaVoiceId: process.env.NOVA_VOICE_ID || "EXAVITQu4vr4xnSDxMaL",

  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",

  episodeOutputDir: resolve(
    process.env.EPISODE_OUTPUT_DIR || `${BASE_DIR}/episodes`
  ),
  databasePath: resolve(
    process.env.DATABASE_PATH || `${BASE_DIR}/data/launchcast.db`
  ),
  dataDir: resolve(BASE_DIR, "data"),

  port: parseInt(process.env.PORT || "8000", 10),
};

// Ensure directories exist
mkdirSync(config.episodeOutputDir, { recursive: true });
mkdirSync(config.dataDir, { recursive: true });

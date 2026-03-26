import { createClient } from "@supabase/supabase-js";
import { config } from "../config.js";
import type { Episode, Product, ScriptLine } from "../models/types.js";

const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

export async function saveEpisode(episode: Episode): Promise<void> {
  const { error } = await supabase
    .from("episodes")
    .upsert({
      id: episode.id,
      date: episode.date,
      title: episode.title,
      duration_seconds: episode.duration_seconds,
      audio_url: episode.audio_url,
      products_json: episode.products,
      script_json: episode.script,
      created_at: episode.created_at,
    });

  if (error) throw new Error(`Supabase saveEpisode failed: ${error.message}`);
}

export async function getEpisode(episodeId: string): Promise<Episode | null> {
  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .eq("id", episodeId)
    .single();

  if (error || !data) return null;
  return rowToEpisode(data);
}

export async function getAllEpisodes(): Promise<Episode[]> {
  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .order("date", { ascending: false });

  if (error || !data) return [];
  return data.map(rowToEpisode);
}

function rowToEpisode(row: Record<string, unknown>): Episode {
  let products: Product[] = [];
  let script: ScriptLine[] = [];

  const pj = row.products_json;
  if (Array.isArray(pj)) {
    products = pj as Product[];
  } else if (typeof pj === "string") {
    try { products = JSON.parse(pj); } catch { /* empty */ }
  }

  const sj = row.script_json;
  if (Array.isArray(sj)) {
    script = sj as ScriptLine[];
  } else if (typeof sj === "string") {
    try { script = JSON.parse(sj); } catch { /* empty */ }
  }

  return {
    id: row.id as string,
    date: row.date as string,
    title: (row.title as string) || "",
    duration_seconds: (row.duration_seconds as number) || 0,
    audio_url: (row.audio_url as string) || "",
    products,
    script,
    created_at: (row.created_at as string) || "",
  };
}

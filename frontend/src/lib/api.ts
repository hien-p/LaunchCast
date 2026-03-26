import { supabase } from "./supabase";
import type { Episode, EpisodeSummary, Product, ScriptLine, UserPreferences } from "./types";

const BASE_URL = "/api";

function rowToEpisode(row: Record<string, any>): Episode {
  let products: Product[] = [];
  let script: ScriptLine[] = [];

  const pj = row.products_json;
  if (Array.isArray(pj)) products = pj;
  else if (typeof pj === "string") {
    try { products = JSON.parse(pj); } catch { /* empty */ }
  }

  const sj = row.script_json;
  if (Array.isArray(sj)) script = sj;
  else if (typeof sj === "string") {
    try { script = JSON.parse(sj); } catch { /* empty */ }
  }

  return {
    id: row.id,
    date: row.date,
    title: row.title || "",
    duration_seconds: row.duration_seconds || 0,
    audio_url: row.audio_url || "",
    products,
    script,
    created_at: row.created_at || "",
  };
}

export async function fetchEpisodes(): Promise<EpisodeSummary[]> {
  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .order("date", { ascending: false });

  if (error || !data) throw new Error("Failed to fetch episodes");

  return data.map((row: any) => {
    const ep = rowToEpisode(row);
    return {
      id: ep.id,
      date: ep.date,
      title: ep.title,
      duration_seconds: ep.duration_seconds,
      audio_url: ep.audio_url,
      product_count: ep.products.length,
      created_at: ep.created_at,
    };
  });
}

export async function fetchEpisode(id: string): Promise<Episode> {
  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) throw new Error("Episode not found");
  return rowToEpisode(data);
}

export async function startGeneration(
  preferences?: UserPreferences,
  phUrl?: string
): Promise<{ episode_id: string; status: string }> {
  const res = await fetch(`${BASE_URL}/generate/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ preferences, ph_url: phUrl || undefined }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Generation failed" }));
    throw new Error(err.error || "Generation failed");
  }
  return res.json();
}

export function getProgressSSEUrl(): string {
  return `${BASE_URL}/generate/progress`;
}

export function getAudioUrl(date: string): string {
  return `${BASE_URL}/episodes/${date}/audio`;
}

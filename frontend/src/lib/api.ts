import type { Episode, EpisodeSummary, UserPreferences } from "./types";

const BASE_URL = "/api";

export async function fetchEpisodes(): Promise<EpisodeSummary[]> {
  const res = await fetch(`${BASE_URL}/episodes`);
  if (!res.ok) throw new Error("Failed to fetch episodes");
  return res.json();
}

export async function fetchEpisode(date: string): Promise<Episode> {
  const res = await fetch(`${BASE_URL}/episodes/${date}`);
  if (!res.ok) throw new Error("Episode not found");
  return res.json();
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

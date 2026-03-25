/**
 * SQLite database for episode metadata storage.
 */

import Database from "better-sqlite3";
import { config } from "../config.js";
import type { Episode, Product, ScriptLine } from "../models/types.js";

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(config.databasePath);
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS episodes (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        title TEXT DEFAULT '',
        duration_seconds INTEGER DEFAULT 0,
        audio_url TEXT DEFAULT '',
        products_json TEXT DEFAULT '[]',
        script_json TEXT DEFAULT '[]',
        created_at TEXT DEFAULT ''
      )
    `);
  }
  return db;
}

export function saveEpisode(episode: Episode): void {
  const db = getDb();
  db.prepare(
    `INSERT OR REPLACE INTO episodes
     (id, date, title, duration_seconds, audio_url, products_json, script_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    episode.id,
    episode.date,
    episode.title,
    episode.duration_seconds,
    episode.audio_url,
    JSON.stringify(episode.products),
    JSON.stringify(episode.script),
    episode.created_at
  );
}

export function getEpisode(episodeId: string): Episode | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM episodes WHERE id = ?")
    .get(episodeId) as any;
  if (!row) return null;
  return rowToEpisode(row);
}

export function getAllEpisodes(): Episode[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM episodes ORDER BY date DESC")
    .all() as any[];
  return rows.map(rowToEpisode);
}

function rowToEpisode(row: any): Episode {
  let products: Product[] = [];
  let script: ScriptLine[] = [];
  try { products = JSON.parse(row.products_json); } catch {}
  try { script = JSON.parse(row.script_json); } catch {}

  return {
    id: row.id,
    date: row.date,
    title: row.title,
    duration_seconds: row.duration_seconds,
    audio_url: row.audio_url,
    products,
    script,
    created_at: row.created_at,
  };
}

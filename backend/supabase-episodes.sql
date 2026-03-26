-- Run in Supabase SQL Editor

create table if not exists episodes (
  id text primary key,
  date text not null,
  title text not null default '',
  duration_seconds integer not null default 0,
  audio_url text not null default '',
  products_json jsonb not null default '[]',
  script_json jsonb not null default '[]',
  created_at text not null default ''
);

create index if not exists idx_episodes_date on episodes(date desc);

alter table episodes enable row level security;

create policy "Service role full access on episodes"
  on episodes for all using (true) with check (true);

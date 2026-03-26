-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

create table if not exists scraped_data (
  id uuid default gen_random_uuid() primary key,
  url text not null default '',
  title text not null default '',
  source_type text not null default 'other',
  summary text not null default '',
  raw_content text not null default '',
  metadata jsonb not null default '{}',
  telegram_user text not null default '',
  telegram_chat_id bigint not null default 0,
  created_at timestamptz default now()
);

-- Index for fast lookups by chat
create index if not exists idx_scraped_data_chat_id on scraped_data(telegram_chat_id);
create index if not exists idx_scraped_data_created on scraped_data(created_at desc);

-- Enable RLS but allow service role full access
alter table scraped_data enable row level security;

create policy "Service role has full access"
  on scraped_data
  for all
  using (true)
  with check (true);

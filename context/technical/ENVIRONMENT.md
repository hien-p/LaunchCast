# Environment Variables

> Never commit real values. This file documents what variables are needed and why.

## Required

| Variable | Description | Example |
|----------|-------------|---------|
| `FIRECRAWL_API_KEY` | Firecrawl API key for web scraping | `fc-...` |
| `ANTHROPIC_API_KEY` | Claude API key for podcast script generation | `sk-ant-...` |
| `ELEVENLABS_API_KEY` | ElevenLabs API key for text-to-speech | `xi-...` |

## Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `AERO_VOICE_ID` | ElevenLabs voice ID for Aero (skeptic host) | TBD |
| `NOVA_VOICE_ID` | ElevenLabs voice ID for Nova (optimist host) | TBD |
| `EPISODE_OUTPUT_DIR` | Directory for generated MP3 files | `./episodes` |
| `DATABASE_PATH` | Path to SQLite database file | `./data/launchcast.db` |
| `PORT` | FastAPI server port | `8000` |
| `VITE_API_URL` | Backend API base URL (used by frontend) | `http://localhost:8000` |

## Setup Instructions

1. Copy `backend/.env.example` to `backend/.env`
2. Copy `frontend/.env.example` to `frontend/.env`
3. Get a Firecrawl API key at https://firecrawl.dev/dashboard
4. Get an Anthropic API key at https://console.anthropic.com
5. Get an ElevenLabs API key at https://elevenlabs.io/settings
6. Voice IDs will be selected during Phase 1 build after testing voices

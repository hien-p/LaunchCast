# LaunchCast - Codebase Summary

## Repository Structure

```
LaunchCast/
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── index.ts           # Express app setup, middleware, route mounting
│   │   ├── config.ts          # Environment variable loading with defaults
│   │   ├── models/
│   │   │   └── types.ts       # Shared TypeScript interfaces
│   │   ├── routes/
│   │   │   ├── episodes.ts    # Episode CRUD + audio streaming endpoints
│   │   │   └── generate.ts    # Generation trigger + SSE progress stream
│   │   └── services/
│   │       ├── pipeline.ts        # Orchestrates full generation workflow
│   │       ├── scraper.ts         # Product Hunt + website scraping (Firecrawl)
│   │       ├── scriptGenerator.ts # Podcast script generation (Gemini)
│   │       ├── voiceSynthesizer.ts # Text-to-speech (ElevenLabs)
│   │       ├── audioStitcher.ts   # MP3 concatenation (FFmpeg)
│   │       └── database.ts        # SQLite persistence (better-sqlite3)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── main.tsx           # React entry point
│   │   ├── App.tsx            # Screen routing state machine
│   │   ├── index.css          # Tailwind config + design tokens
│   │   ├── screens/
│   │   │   ├── VibeSetup.tsx          # Onboarding + generation trigger
│   │   │   ├── GenerationViewer.tsx   # Real-time SSE progress UI
│   │   │   └── PlayerScreen.tsx       # Episode player + transcript
│   │   ├── components/
│   │   │   ├── AudioPlayer.tsx        # Legacy audio player
│   │   │   ├── ProductCard.tsx        # Product summary card
│   │   │   ├── ProductDeepDive.tsx    # Product detail modal
│   │   │   └── ui/                    # Headless + composed UI primitives
│   │   │       ├── audio-player.tsx   # AudioPlayerProvider + controls
│   │   │       ├── transcript-viewer.tsx # Word-level synced transcript
│   │   │       ├── scrub-bar.tsx      # Draggable progress control
│   │   │       ├── waveform.tsx       # Audio visualization
│   │   │       ├── shimmering-text.tsx # Animated shimmer text
│   │   │       ├── message.tsx        # Chat-style conversation bubble
│   │   │       ├── button.tsx         # CVA-styled button variants
│   │   │       ├── avatar.tsx         # Avatar with fallback + badge
│   │   │       ├── dropdown-menu.tsx  # Radix dropdown wrapper
│   │   │       └── progress.tsx       # Progress bar
│   │   ├── hooks/
│   │   │   ├── usePreferences.ts  # localStorage-backed preferences
│   │   │   └── useSSE.ts         # EventSource wrapper for SSE
│   │   ├── lib/
│   │   │   ├── api.ts            # REST endpoint helpers
│   │   │   ├── types.ts          # Frontend TypeScript interfaces
│   │   │   └── utils.ts          # cn() utility (clsx + tailwind-merge)
│   │   └── assets/               # Static images (hero, logos)
│   ├── public/                   # Favicon, icons SVG
│   ├── package.json
│   ├── vite.config.ts
│   ├── components.json           # shadcn CLI configuration
│   └── .env.example
├── context/                      # Project documentation (Claude Code context)
│   ├── project/                  # Overview, scope, roadmap, decisions, tasks
│   ├── technical/                # Stack, architecture, API contracts, data models
│   ├── features/                 # Feature specs (f1-f10)
│   ├── design/                   # Design system, components, UX patterns
│   ├── developer/                # Conventions, workflow, testing, security
│   └── ops/                      # Infrastructure, CI/CD, monitoring
├── .claude/                      # Claude Code agent configs + hooks
├── README.md
└── .gitignore
```

---

## Backend

### Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | ES2022 target | Runtime |
| TypeScript | ^5.7.2 | Type safety |
| Express.js | ^4.21.1 | HTTP server |
| better-sqlite3 | ^11.7.0 | SQLite database |
| @google/generative-ai | ^0.24.1 | Gemini LLM |
| @mendable/firecrawl-js | ^1.15.0 | Web scraping |
| elevenlabs | ^1.50.0 | Text-to-speech |
| fluent-ffmpeg | ^2.1.3 | Audio processing |
| cors | ^2.8.5 | CORS middleware |
| dotenv | ^16.4.7 | Env config |

### API Endpoints

#### Episodes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/episodes` | List all episodes (metadata only) |
| GET | `/api/episodes/:date` | Get full episode with script and products |
| GET | `/api/episodes/:date/audio` | Stream MP3 with HTTP Range support |
| GET | `/api/episodes/:date/products/:name` | Get product deep-dive data |

#### Generation

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/generate/start` | Trigger generation with SSE progress |
| GET | `/api/generate/progress` | SSE stream for real-time progress |
| POST | `/api/generate` | Fire-and-forget generation (no SSE) |

#### System

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |

### Services

| Service | Responsibility | External API |
|---------|---------------|--------------|
| `pipeline.ts` | Orchestrates full generation workflow, emits SSE events | None (coordinator) |
| `scraper.ts` | Scrapes PH launches + deep-crawls product websites | Firecrawl |
| `scriptGenerator.ts` | Generates two-host debate script with ratings | Google Gemini 2.5 Flash |
| `voiceSynthesizer.ts` | Converts script lines to MP3 audio clips | ElevenLabs TTS |
| `audioStitcher.ts` | Concatenates voice clips with pauses into final episode | FFmpeg CLI |
| `database.ts` | Persists episode metadata to SQLite | None (local) |

### Data Storage

- **SQLite** (`data/launchcast.db`) - Episode metadata with JSON-serialized products and scripts
- **JSON cache** (`data/ph_products_YYYY-MM-DD.json`) - Daily PH scrape cache to avoid re-scraping
- **Filesystem** (`episodes/`) - MP3 files and individual voice clips

---

## Frontend

### Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | ^19.2.4 | UI framework |
| TypeScript | ~5.9.3 | Type safety |
| Vite | ^8.0.1 | Build tool + dev server |
| Tailwind CSS | ^4.2.2 | Utility-first styling |
| @base-ui/react | ^1.3.0 | Headless UI primitives |
| @radix-ui/react-slider | ^1.3.6 | Slider component |
| motion | ^12.38.0 | Animation library |
| lucide-react | ^1.7.0 | Icons |
| @elevenlabs/elevenlabs-js | ^2.40.0 | ElevenLabs SDK |
| class-variance-authority | ^0.7.1 | Component variants |

### Screen Flow

```
App.tsx (state machine)
│
├── "setup" ──────► VibeSetup
│                   - Interest tag selection
│                   - PH URL input (optional)
│                   - Preference toggles
│                   - "Generate" button triggers POST /api/generate/start
│
├── "generating" ──► GenerationViewer
│                   - SSE connection to /api/generate/progress
│                   - 6-step progress tracker
│                   - Live crawl URL logs
│                   - Product cards as they're discovered
│                   - Auto-transitions to "player" on completion
│
└── "player" ──────► PlayerScreen
                    - AudioPlayerProvider context
                    - Episode header + show notes
                    - Synced transcript viewer
                    - Bottom sticky player bar (play/pause, scrub, speed)
                    - ProductDeepDive modal (click product card)
```

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `usePreferences()` | localStorage-backed user preferences (interests, toggles) |
| `useSSE(url)` | EventSource wrapper with auto-reconnect and event accumulation |
| `useAudioPlayer()` | Audio playback context (play, pause, seek, rate) |
| `useAudioPlayerTime()` | Animation-frame synced current playback time |

### Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | #0A0A0B | Page background |
| `--color-surface` | #141416 | Card/panel background |
| `--color-aero` | #F97316 | AERO host (orange) |
| `--color-nova` | #8B5CF6 | NOVA host (purple) |
| `--color-action` | #3B82F6 | Primary actions (blue) |
| `--color-text-primary` | #F5F5F5 | Main text |
| `--color-text-secondary` | #A1A1AA | Secondary text |
| `--font-sans` | Geist Variable | Primary font |
| `--radius` | 0.625rem | Border radius |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `FIRECRAWL_API_KEY` | Yes | - | Firecrawl web scraping API |
| `GEMINI_API_KEY` | Yes | - | Google Generative AI API |
| `ELEVENLABS_API_KEY` | Yes | - | ElevenLabs TTS API |
| `AERO_VOICE_ID` | No | TX3LPaxmHKxFdv7VOQHJ | ElevenLabs voice for AERO |
| `NOVA_VOICE_ID` | No | EXAVITQu4vr4xnSDxMaL | ElevenLabs voice for NOVA |
| `EPISODE_OUTPUT_DIR` | No | ./episodes | MP3 output directory |
| `DATABASE_PATH` | No | ./data/launchcast.db | SQLite path |
| `PORT` | No | 8000 | Server port |
| `ALLOWED_ORIGIN` | No | http://localhost:5173 | CORS origin |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | (Vite proxy) | Backend API URL |

---

## Data Models

### Core Types

```typescript
interface Product {
  name: string
  tagline: string
  ph_url: string
  website_url: string
  upvotes: number
  ph_description: string
  website_content: string           // max 5000 chars
  pricing: { free_tier: boolean, plans: PricingPlan[] }
  features: string[]                // max 10
  target_audience: string
  aero_rating: number               // 1-10
  nova_rating: number               // 1-10
  segment_start_seconds: number
  segment_end_seconds: number
}

interface ScriptLine {
  speaker: "AERO" | "NOVA"
  text: string
  product_ref: string | null
  type: "intro" | "analysis" | "hot_take" | "rating" | "transition" | "outro"
}

interface Episode {
  id: string                        // YYYY-MM-DD
  date: string
  title: string
  duration_seconds: number
  audio_url: string
  products: Product[]
  script: ScriptLine[]
  created_at: string
}
```

### Database Schema (SQLite)

```sql
CREATE TABLE episodes (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  title TEXT DEFAULT '',
  duration_seconds INTEGER DEFAULT 0,
  audio_url TEXT DEFAULT '',
  products_json TEXT DEFAULT '[]',
  script_json TEXT DEFAULT '[]',
  created_at TEXT DEFAULT ''
);
```

---

## SSE Event Types

| Event | Payload | Description |
|-------|---------|-------------|
| `connected` | - | Initial connection |
| `scraping_ph` | - | Scanning Product Hunt |
| `product_found` | product metadata | Discovered a product |
| `deep_dive_start` | - | Starting website scraping |
| `scraping_website` | { url } | Crawling a product website |
| `website_scraped` | { name, features } | Website analysis complete |
| `deep_dive_complete` | - | All websites analyzed |
| `generating_script` | - | Gemini generating script |
| `script_ready` | - | Script complete |
| `synthesizing_voice` | { line_index, total_lines } | ElevenLabs TTS progress |
| `voice_error` | { error } | Voice synthesis failure |
| `stitching_audio` | - | FFmpeg mixing |
| `complete` | { episode_id } | Episode ready |
| `error` | { error } | Pipeline failure |

---

## Error Handling Strategy

| Layer | Approach |
|-------|----------|
| Routes | HTTP status codes (400, 404, 409) with JSON error messages |
| Pipeline | Try-catch with SSE error events, graceful degradation |
| Scraper | Website failures fall back to PH-only data |
| Voice Synthesizer | Skips failed lines, emits `voice_error` event |
| Database | JSON parse failures default to empty arrays |
| Frontend | Error state in App.tsx, user-facing error messages |

### Key HTTP Status Codes

- `200` Success
- `206` Partial content (audio range requests)
- `400` Invalid input (bad date format, invalid PH URL)
- `404` Episode/audio/product not found
- `409` Generation already in progress (single-generation lock)

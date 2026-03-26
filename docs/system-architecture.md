# LaunchCast - System Architecture

## High-Level Overview

LaunchCast is a two-tier web application: a React SPA frontend communicating with an Express.js backend via REST + Server-Sent Events. The backend orchestrates a pipeline of external AI services to generate podcast episodes from Product Hunt data.

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React SPA)                 │
│                                                         │
│  VibeSetup ──► GenerationViewer ──► PlayerScreen        │
│     │               ▲                    │              │
│     │          SSE events                │              │
│     ▼               │                    ▼              │
│  POST /generate  GET /generate/      GET /episodes      │
│    /start          progress          /:date/audio       │
└─────────┬───────────┬────────────────────┬──────────────┘
          │           │                    │
          ▼           ▼                    ▼
┌─────────────────────────────────────────────────────────┐
│                   Backend (Express.js)                    │
│                                                         │
│  Routes Layer                                           │
│  ├── /api/generate/*   (generation trigger + SSE)       │
│  ├── /api/episodes/*   (episode CRUD + audio stream)    │
│  └── /api/health                                        │
│                                                         │
│  Service Layer                                          │
│  ├── pipeline.ts ──────── Orchestrator                  │
│  │     │                                                │
│  │     ├── scraper.ts ─────────► Firecrawl API          │
│  │     ├── scriptGenerator.ts ─► Google Gemini API      │
│  │     ├── voiceSynthesizer.ts ► ElevenLabs API         │
│  │     ├── audioStitcher.ts ───► FFmpeg CLI             │
│  │     └── database.ts ────────► SQLite                 │
│  │                                                      │
│  Data Layer                                             │
│  ├── SQLite (episode metadata)                          │
│  ├── JSON files (daily scrape cache)                    │
│  └── Filesystem (MP3 episodes + clips)                  │
└─────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend

```
App.tsx (State Machine: "setup" | "generating" | "player")
│
├── VibeSetup
│   ├── Interest tag grid
│   ├── PH URL input (optional single-product mode)
│   ├── Preference toggles (deep dives, technical detail)
│   └── Generate button → POST /api/generate/start
│
├── GenerationViewer
│   ├── Step progress indicator (6 stages)
│   ├── SSE event consumer (useSSE hook)
│   ├── Live crawl URL log
│   ├── Product card grid (populated as products are found)
│   └── Auto-transition to player on "complete" event
│
└── PlayerScreen
    ├── AudioPlayerProvider (React Context)
    │   ├── Episode header (title, date, duration)
    │   ├── Show notes (collapsible)
    │   ├── TranscriptViewer (word-level sync)
    │   ├── ProductCard (floating, linked to transcript segments)
    │   └── BottomPlayerBar
    │       ├── AudioPlayerProgress (Radix Slider)
    │       ├── Play/Pause button
    │       ├── Time display
    │       └── Speed dropdown (0.25x - 2x)
    └── ProductDeepDive (modal overlay)
        ├── PH description vs Firecrawl findings
        ├── Pricing breakdown
        ├── Feature list
        └── Per-host ratings (AERO + NOVA)
```

### Backend

```
Express App (index.ts)
│
├── Middleware: CORS, JSON parser, static files
│
├── Routes
│   ├── episodes.ts
│   │   ├── GET /api/episodes          → getAllEpisodes()
│   │   ├── GET /api/episodes/:date    → getEpisode()
│   │   ├── GET /api/episodes/:date/audio → streamAudio()
│   │   └── GET /api/episodes/:date/products/:name → getProduct()
│   │
│   └── generate.ts
│       ├── POST /api/generate/start   → triggerGeneration()
│       ├── GET /api/generate/progress → SSE stream
│       └── POST /api/generate         → fire-and-forget
│
└── Services
    └── pipeline.ts (Orchestrator)
        │
        ├── 1. scraper.scrapeProductHunt()
        │      └── Firecrawl Search API → top 10 PH launches
        │
        ├── 2. scraper.deepScrapeAllProducts()
        │      └── Firecrawl Scrape API → website content per product
        │
        ├── 3. scriptGenerator.generateScript()
        │      └── Gemini 2.5 Flash → AERO/NOVA dialogue JSON
        │
        ├── 4. voiceSynthesizer.synthesizeScript()
        │      └── ElevenLabs TTS → MP3 clips per line
        │
        ├── 5. audioStitcher.stitchAudio()
        │      └── FFmpeg concat → single episode MP3
        │
        └── 6. database.saveEpisode()
               └── SQLite INSERT → episode metadata
```

---

## Data Flow

### Episode Generation (Happy Path)

```
1. User clicks "Generate" in VibeSetup
   │
   ▼
2. Frontend: POST /api/generate/start { preferences, ph_url? }
   │
   ▼
3. Backend validates request, acquires generation lock
   Returns: { episode_id, status: "generating" }
   │
   ▼
4. Frontend: connects EventSource to GET /api/generate/progress
   │
   ▼
5. Pipeline executes stages sequentially:
   │
   ├── Stage 1: Scrape PH ──────────────► SSE: scraping_ph, product_found (x N)
   ├── Stage 2: Deep scrape websites ───► SSE: scraping_website, website_scraped (x N)
   ├── Stage 3: Generate script ────────► SSE: generating_script, script_ready
   ├── Stage 4: Synthesize voices ──────► SSE: synthesizing_voice (x lines)
   ├── Stage 5: Stitch audio ──────────► SSE: stitching_audio
   └── Stage 6: Save to DB ───────────► SSE: complete { episode_id }
   │
   ▼
6. Frontend auto-transitions to PlayerScreen
   │
   ▼
7. PlayerScreen: GET /api/episodes/:date → full episode data
   Audio element: GET /api/episodes/:date/audio → MP3 stream
```

### Single Product Mode

When user provides a specific Product Hunt URL:
- Scraper fetches only that product (bypasses top-10 search)
- Pipeline continues normally from Stage 2 onward
- Produces a shorter, single-product episode

---

## Key Architectural Decisions

### React + Vite (not Next.js)

Client-heavy SPA with no SEO needs. Vite provides faster HMR and simpler config. No server-side rendering required - all content is audio-first.

### TypeScript Everywhere

Unified language across frontend and backend enables shared type understanding (though types are not shared as a package - they're defined separately in each codebase).

### Express + SSE (not WebSocket)

Server-Sent Events are ideal for this use case: one-way server-to-client progress updates. Simpler than WebSocket, supports auto-reconnect natively, and Express has built-in support.

### SQLite + JSON Files (not Postgres)

Zero-infrastructure database for hackathon. Episode data is append-only (write once, read many). JSON files cache daily scrapes. Both can be migrated to Postgres later if needed.

### Single Generation Lock

`isGenerating` boolean prevents concurrent episode generation. Returns HTTP 409 if a generation is already in progress. This simplifies resource management and prevents race conditions.

### Service-per-API Pattern

Each external API integration is isolated in its own service file. This makes it easy to:
- Mock individual services for testing
- Swap providers (e.g., replace Gemini with Claude)
- Rate-limit per service independently
- Handle failures per service without cascading

### Graceful Degradation

- Website scraping failures don't block script generation (falls back to PH-only data)
- Voice synthesis failures skip individual lines rather than aborting
- Each stage emits SSE events so the frontend always shows progress

---

## Communication Patterns

### REST (Request-Response)

Used for: episode listing, episode detail, audio streaming, generation trigger.

### SSE (Server-Push)

Used for: real-time generation progress. The frontend's `useSSE` hook manages the EventSource lifecycle and accumulates events for the GenerationViewer to render.

### Audio Streaming

The backend serves MP3 files with HTTP Range header support, enabling:
- Progressive loading (play before full download)
- Seeking without downloading the entire file
- Standard HTML5 `<audio>` element compatibility

---

## Storage Architecture

```
LaunchCast/
├── backend/
│   ├── data/
│   │   ├── launchcast.db              # SQLite database (WAL mode)
│   │   └── ph_products_YYYY-MM-DD.json # Daily scrape cache
│   └── episodes/
│       ├── YYYY-MM-DD.mp3             # Final episode audio
│       └── clips_YYYY-MM-DD/          # Individual voice clips
│           ├── clip_000_aero.mp3
│           ├── clip_001_nova.mp3
│           └── ...
└── frontend/
    └── localStorage
        └── launchcast_preferences     # User preferences JSON
```

---

## External Service Integration

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Firecrawl   │     │Google Gemini │     │  ElevenLabs  │
│              │     │  2.5 Flash   │     │              │
│ - Search API │     │              │     │ - TTS API    │
│ - Scrape API │     │ - Chat API   │     │ - v2 voices  │
│              │     │ - JSON mode  │     │ - MP3 output │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       ▼                    ▼                    ▼
   scraper.ts      scriptGenerator.ts   voiceSynthesizer.ts
       │                    │                    │
       └────────────────────┴────────────────────┘
                            │
                     pipeline.ts
                     (orchestrator)
```

### Rate Limiting & Concurrency

| Service | Constraint |
|---------|-----------|
| Firecrawl | 5 concurrent website scrapes |
| ElevenLabs | 200ms delay between TTS requests |
| Gemini | Single request per generation |
| FFmpeg | Single process per stitch operation |

---

## Deployment Architecture (Target)

```
┌─────────────┐          ┌─────────────────┐
│   Vercel    │  proxy   │ Railway / Render │
│  (Frontend) │ ───────► │    (Backend)     │
│             │          │                  │
│  React SPA  │          │  Express.js      │
│  Static     │          │  SQLite          │
│             │          │  Episodes dir    │
└─────────────┘          └─────────────────┘
```

- **Frontend:** Static SPA deployed to Vercel
- **Backend:** Node.js server on Railway or Render with persistent storage for SQLite and MP3 files
- **No external database service** - SQLite runs embedded in the backend process

# LaunchCast

**Product Hunt, but you just listen.**

LaunchCast is an AI-generated daily podcast that delivers Product Hunt's trending launches as an engaging two-host debate. AERO (the skeptic) and NOVA (the optimist) analyze each product, visit the actual websites, and give independent ratings -- so you get real takes, not just hype.

## How It Works

1. **Scrapes Product Hunt** - Finds today's top launches via Firecrawl
2. **Deep-crawls each product website** - Goes beyond the PH blurb to analyze real features, pricing, and audience
3. **Generates a debate script** - Google Gemini creates a two-host conversation with disagreements and independent ratings
4. **Synthesizes voice audio** - ElevenLabs TTS produces natural speech for both hosts
5. **Delivers a ready-to-listen episode** - FFmpeg stitches clips into a single MP3

Users watch the entire pipeline work in real-time through a live generation viewer, then listen in a full-featured web player with synced transcripts and product deep-dives.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4 |
| Backend | Node.js, TypeScript, Express.js |
| Database | SQLite (better-sqlite3) |
| AI Services | Google Gemini 2.5 Flash, ElevenLabs TTS, Firecrawl |
| Audio | FFmpeg |
| UI Components | Base-UI, Radix UI, shadcn, Motion |

## Getting Started

### Prerequisites

- Node.js 20+
- FFmpeg installed and available in PATH
- API keys for: Firecrawl, Google Gemini, ElevenLabs

### Setup

```bash
# Clone the repository
git clone <repo-url> && cd LaunchCast

# Install backend dependencies
cd backend
cp .env.example .env    # Add your API keys
npm install

# Install frontend dependencies
cd ../frontend
cp .env.example .env
npm install
```

### Environment Variables

Create `backend/.env` with:

```env
FIRECRAWL_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
ELEVENLABS_API_KEY=your_key_here

# Optional (have defaults)
AERO_VOICE_ID=TX3LPaxmHKxFdv7VOQHJ
NOVA_VOICE_ID=EXAVITQu4vr4xnSDxMaL
PORT=8000
```

### Running

```bash
# Terminal 1: Start backend (port 8000)
cd backend && npm run dev

# Terminal 2: Start frontend (port 5173)
cd frontend && npm run dev
```

Open http://localhost:5173 to use the app.

## App Screens

### Vibe Setup
Select your interests, optionally paste a specific Product Hunt URL, and hit Generate.

### Generation Viewer
Watch the pipeline work in real-time: see products discovered, websites crawled, script generated, and voices synthesized -- all streamed via Server-Sent Events.

### Player
Listen to the episode with a full-featured audio player: synced transcript, product cards with segment seeking, playback speed control, and product deep-dive modals comparing PH descriptions with actual website analysis.

## Architecture

```
Frontend (React SPA)
    |
    |-- REST API + SSE
    |
Backend (Express.js)
    |
    |-- Pipeline Orchestrator
    |     |
    |     |-- Scraper (Firecrawl)
    |     |-- Script Generator (Gemini)
    |     |-- Voice Synthesizer (ElevenLabs)
    |     |-- Audio Stitcher (FFmpeg)
    |     |-- Database (SQLite)
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/episodes` | List all episodes |
| GET | `/api/episodes/:date` | Get episode with full data |
| GET | `/api/episodes/:date/audio` | Stream episode MP3 |
| GET | `/api/episodes/:date/products/:name` | Get product deep-dive |
| POST | `/api/generate/start` | Trigger episode generation |
| GET | `/api/generate/progress` | SSE progress stream |

## Host Personas

**AERO** (Orange) - The Skeptic. Technical, analytical, rates conservatively. Asks hard questions about whether products deliver on their promises.

**NOVA** (Purple) - The Optimist. Enthusiastic, product-focused, rates generously. Highlights market potential and creator empowerment.

## Project Structure

```
LaunchCast/
├── backend/
│   └── src/
│       ├── routes/       # API endpoints
│       ├── services/     # Business logic (one per external API)
│       └── models/       # TypeScript interfaces
├── frontend/
│   └── src/
│       ├── screens/      # Full-page views (Setup, Generation, Player)
│       ├── components/   # Feature + UI components
│       ├── hooks/        # Custom hooks (preferences, SSE, audio)
│       └── lib/          # API client, types, utilities
├── context/              # Project documentation
└── docs/                 # Technical documentation
```

## Documentation

Detailed documentation lives in `docs/`:

- [Project Overview & PDR](docs/project-overview-pdr.md) - Vision, features, requirements
- [Codebase Summary](docs/codebase-summary.md) - Full technical reference
- [Code Standards](docs/code-standards.md) - Conventions and patterns
- [System Architecture](docs/system-architecture.md) - Architecture diagrams and decisions

## External Services & Estimated Costs

| Service | Usage | Cost |
|---------|-------|------|
| Firecrawl | ~22 credits/day (search + scrape) | Pay-per-use |
| Google Gemini | ~1 request/episode | ~$0.05/episode |
| ElevenLabs | ~50-100 TTS calls/episode | Free/Starter tier |

## License

Hackathon project - see repository for license details.

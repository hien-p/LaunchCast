# LaunchCast - Project Overview & PDR

## Product Overview

**LaunchCast** is an AI-generated daily podcast that delivers Product Hunt's trending launches in an engaging, audio-first debate format between two AI hosts.

**Tagline:** "Product Hunt, but you just listen."

### The Problem

Indie hackers and vibe coders want to stay informed about daily Product Hunt launches but don't have time to scroll, click through, and evaluate what's real versus hype. Current alternatives are either surface-level (miss depth) or time-consuming (require manual browsing).

### The Solution

An automated pipeline that:
1. Scrapes today's top Product Hunt launches
2. Deep-crawls each product's actual website (not just the PH blurb)
3. Generates a two-host debate podcast with independent ratings
4. Synthesizes realistic voice audio and delivers a ready-to-listen episode

### Key Differentiators

- **Deep website analysis** via Firecrawl - goes beyond PH descriptions to analyze real product sites
- **Two-host debate format** - AERO (skeptic) vs NOVA (optimist) create natural tension
- **Independent ratings** - each host rates 1-10, disagreements are highlighted
- **Live generation visibility** - users watch the pipeline work in real-time via SSE
- **Single-click generation** - no terminal commands, no configuration

---

## Target Audience

| Segment | Description | Use Case |
|---------|-------------|----------|
| **Primary** | Vibe coders / indie hackers | Listen during commute or while coding |
| **Secondary** | Early-stage startup founders | Monitor competitive landscape for quick intel |
| **Tertiary** | Tech-curious PMs, designers, trend followers | Passive, audio-first learning |

---

## Product Development Requirements

### P0 - Must Have (Hackathon Demo)

| ID | Feature | Status |
|----|---------|--------|
| F1 | PH Scraping Pipeline - Firecrawl scrapes top 5-10 daily launches | Complete |
| F2 | Deep Product Analysis - Firecrawl visits each product website | Complete |
| F3 | Podcast Script Generation - Gemini generates AERO/NOVA dialogue | Complete |
| F4 | Voice Synthesis - ElevenLabs TTS + FFmpeg stitching | Complete |
| F5 | Web Player - Audio player with show notes, product cards, segment seek | Complete |
| F6 | Vibe Setup - Onboarding: interests, host bios, generation trigger | Complete |
| F7 | Live Generation Viewer - SSE progress UI with crawl logs | Complete |
| F8 | Product Deep Dive - Modal with PH vs Firecrawl comparison | Complete |

### P1 - Should Have (Post-Hackathon)

| ID | Feature | Status |
|----|---------|--------|
| F9 | Live Interactive Mode - ElevenAgents voice chat with hosts | Deferred |
| F10 | Trend Radar - Weekly category trends, host picks, agreement rates | Deferred |

### Out of Scope (v1)

- User accounts and authentication
- Email/push notifications
- RSS feed for podcast apps
- Episode search / full-text search
- Personalized episodes per user (beyond localStorage)
- Daily cron automation (manual trigger in v1)
- SEO optimization / OG images
- Analytics dashboard
- Mobile native app
- Multi-language support

### Never In Scope

- Paid content or paywalls
- User-generated content (comments, reviews)
- Social features (following, profiles)
- Direct Product Hunt API partnership
- Competing with Product Hunt itself

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Time to first listen | < 3 seconds |
| Episode generation time | < 5 minutes |
| Average listen duration | > 60% of episode |
| Daily active listeners | 500 in first month |
| Shares per episode | > 5% of listeners |

---

## Host Personas

### AERO (The Skeptic)
- **Color:** Orange (#F97316)
- **Voice ID:** TX3LPaxmHKxFdv7VOQHJ
- **Personality:** Technical, analytical, skeptical of hype, rates conservatively
- **Role:** Asks hard questions, checks if the product delivers on promises

### NOVA (The Optimist)
- **Color:** Purple (#8B5CF6)
- **Voice ID:** EXAVITQu4vr4xnSDxMaL
- **Personality:** Enthusiastic, product-focused, finds value, rates generously
- **Role:** Highlights potential, market opportunity, creator empowerment

---

## Episode Format

### Structure
1. **Intro** - Hosts greet listeners, tease the lineup
2. **Per-Product Segments** (1-3 minutes each)
   - Quick intro (1-2 lines)
   - Analysis: what PH says vs what the website actually shows
   - Hot takes with required disagreement (for 2+ products)
   - Independent 1-10 ratings from each host
3. **Outro** - Recap, sign off

### Generation Pipeline

```
User triggers generation (Vibe Setup)
    |
    v
[F1] Scrape Product Hunt (Firecrawl Search API)
    |
    v
[F2] Deep-crawl each product website (Firecrawl Scrape)
    |
    v
[F3] Generate podcast script (Google Gemini 2.5 Flash)
    |
    v
[F4] Synthesize voice per line (ElevenLabs TTS)
    |
    v
[F4] Stitch audio clips (FFmpeg concat)
    |
    v
Episode saved to SQLite + MP3 to filesystem
    |
    v
[F5] Player loads episode automatically
```

---

## Roadmap

| Phase | Timeline | Scope | Status |
|-------|----------|-------|--------|
| Phase 1 | Day 1 Morning | Core pipeline + Vibe Setup (F1-F4, F6) | Complete |
| Phase 2 | Day 1 Afternoon | Web Player + Generation Viewer (F5, F7, F8) | Complete |
| Phase 3 | Day 2 | Live Mode + Trend Radar (F9, F10) | Deferred |
| Phase 4 | Post-Hackathon | Automation, RSS, archive, notifications | Planned |

---

## Open Questions

- Podcast length: 10 minutes (top 5) or 20 minutes (top 10)?
- Music bed: License royalty-free or generate with AI music?
- PH data source: Direct scrape vs API/RSS?
- ElevenLabs voice selection: Final voice IDs confirmed?

---

## External Service Dependencies

| Service | Purpose | Cost Model |
|---------|---------|------------|
| Firecrawl | Web scraping & product data extraction | ~22 credits/day |
| Google Gemini | Podcast script generation (2.5 Flash) | ~$0.05/episode |
| ElevenLabs | Text-to-speech synthesis | Free/Starter tier |
| FFmpeg | Audio stitching (local CLI) | Free |

# Task List

> The single source of truth for what needs to be done.
> Updated by Claude after every meaningful piece of work.
> Each task links to the feature file it belongs to.
>
> **Status keys:**
> `[ ]` todo · `[~]` in progress · `[x]` done · `[-]` blocked · `[>]` deferred

---

## How Tasks Are Numbered

Tasks are numbered globally across the whole project: T1, T2, T3...
They never get renumbered — a completed task keeps its number forever.
This means you can reference "T12" in a commit message or conversation and
it always points to the same thing.

---

## Active Sprint

No active tasks — all V1 features built. Pending code review and UAT.

| # | Status | Task | Feature | Notes |
|---|--------|------|---------|-------|

---

## Backlog

### Phase 3 (Deferred — Live Mode + Trends)

| # | Status | Task | Feature | Notes |
|---|--------|------|---------|-------|
| T41 | `[>]` | Set up ElevenAgents with Aero & Nova personas | [F9](../features/f9-live-interactive-mode.md) | P1 |
| T42 | `[>]` | Configure Firecrawl as ElevenAgents Server Tool | [F9](../features/f9-live-interactive-mode.md) | P1 |
| T43 | `[>]` | Build voice chat UI with transcript | [F9](../features/f9-live-interactive-mode.md) | P1 |
| T44 | `[>]` | Build context panel that updates with search results | [F9](../features/f9-live-interactive-mode.md) | P1 |
| T45 | `[>]` | Add visible URL display during live Firecrawl searches | [F9](../features/f9-live-interactive-mode.md) | P1 |
| T46 | `[>]` | Build trend aggregation service (7-day lookback) | [F10](../features/f10-trend-radar.md) | P1 |
| T47 | `[>]` | Build Trend Radar page layout | [F10](../features/f10-trend-radar.md) | P1 |
| T48 | `[>]` | Implement host picks and agreement rate calculation | [F10](../features/f10-trend-radar.md) | P1 |
| T49 | `[>]` | Link disagreement highlights to specific episode segments | [F10](../features/f10-trend-radar.md) | P1 |

---

## Blocked

| # | Task | Feature | Blocked by |
|---|------|---------|------------|
| — | — | — | — |

---

## Completed

| # | Task | Feature | Completed |
|---|------|---------|-----------|
| T1 | Set up Express/TypeScript backend project structure | [F1](../features/f1-ph-scraping-pipeline.md) | 2026-03-24 |
| T2 | Implement Firecrawl PH scraping service (search + parse) | [F1](../features/f1-ph-scraping-pipeline.md) | 2026-03-24 |
| T3 | Create `/api/generate` endpoint that triggers the pipeline | [F1](../features/f1-ph-scraping-pipeline.md) | 2026-03-24 |
| T4 | Add JSON file caching for scraped PH data | [F1](../features/f1-ph-scraping-pipeline.md) | 2026-03-24 |
| T5 | Implement deep scrape service (Firecrawl per product URL) | [F2](../features/f2-deep-product-analysis.md) | 2026-03-24 |
| T6 | Add parallel scraping with concurrency limit | [F2](../features/f2-deep-product-analysis.md) | 2026-03-24 |
| T7 | Handle scrape failures gracefully (fallback to PH blurb) | [F2](../features/f2-deep-product-analysis.md) | 2026-03-24 |
| T8 | Design Aero/Nova system prompt with persona definitions | [F3](../features/f3-podcast-script-generation.md) | 2026-03-24 |
| T9 | Implement script generation service (Claude API + JSON parsing) | [F3](../features/f3-podcast-script-generation.md) | 2026-03-24 |
| T10 | Add ScriptLine validation (format, speaker names, types) | [F3](../features/f3-podcast-script-generation.md) | 2026-03-24 |
| T11 | Integrate Vibe Setup preferences into prompt context | [F3](../features/f3-podcast-script-generation.md) | 2026-03-24 |
| T12 | Configure ElevenLabs voice IDs for Aero and Nova | [F4](../features/f4-voice-synthesis.md) | 2026-03-24 |
| T13 | Implement TTS service (script line → audio clip via ElevenLabs) | [F4](../features/f4-voice-synthesis.md) | 2026-03-24 |
| T14 | Implement audio stitcher (FFmpeg: clips → single MP3 with pauses) | [F4](../features/f4-voice-synthesis.md) | 2026-03-24 |
| T15 | Save episode metadata to SQLite and audio file to filesystem | [F4](../features/f4-voice-synthesis.md) | 2026-03-24 |
| T16 | Create audio serving endpoint (`GET /api/episodes/{date}/audio`) | [F4](../features/f4-voice-synthesis.md) | 2026-03-24 |
| T17 | Set up React + Vite frontend project structure | [F5](../features/f5-web-player.md) | 2026-03-24 |
| T18 | Build audio player component with play/pause/seek | [F5](../features/f5-web-player.md) | 2026-03-24 |
| T19 | Build show notes component with product cards | [F5](../features/f5-web-player.md) | 2026-03-24 |
| T20 | Implement segment seek (tap product → jump to timestamp) | [F5](../features/f5-web-player.md) | 2026-03-24 |
| T21 | Build episode archive list | [F5](../features/f5-web-player.md) | 2026-03-24 |
| T22 | Add sticky mobile player bar | [F5](../features/f5-web-player.md) | 2026-03-24 |
| T23 | Create API client for fetching episodes | [F5](../features/f5-web-player.md) | 2026-03-24 |
| T24 | Build Vibe Setup screen layout (interest tags, toggles, host bios) | [F6](../features/f6-vibe-setup.md) | 2026-03-24 |
| T25 | Implement interest tag selector with localStorage persistence | [F6](../features/f6-vibe-setup.md) | 2026-03-24 |
| T26 | Add host bio cards with Aero/Nova personality descriptions | [F6](../features/f6-vibe-setup.md) | 2026-03-24 |
| T27 | Add voice preview button (plays static audio sample) | [F6](../features/f6-vibe-setup.md) | 2026-03-24 |
| T28 | Wire CTA button to trigger generation and navigate to Generation screen | [F6](../features/f6-vibe-setup.md) | 2026-03-24 |
| T29 | Implement SSE endpoint in Express for generation progress | [F7](../features/f7-live-generation.md) | 2026-03-24 |
| T30 | Emit SSE events from each pipeline stage | [F7](../features/f7-live-generation.md) | 2026-03-24 |
| T31 | Build Generation screen with step indicator | [F7](../features/f7-live-generation.md) | 2026-03-24 |
| T32 | Build live URL display component | [F7](../features/f7-live-generation.md) | 2026-03-24 |
| T33 | Build product card grid that populates as products are scraped | [F7](../features/f7-live-generation.md) | 2026-03-24 |
| T34 | Wire auto-transition to Player on `complete` event | [F7](../features/f7-live-generation.md) | 2026-03-24 |
| T35 | Add useSSE custom hook for EventSource management | [F7](../features/f7-live-generation.md) | 2026-03-24 |
| T36 | Build Product Deep Dive modal layout | [F8](../features/f8-product-deep-dive.md) | 2026-03-24 |
| T37 | Implement PH vs Firecrawl side-by-side comparison | [F8](../features/f8-product-deep-dive.md) | 2026-03-24 |
| T38 | Render extracted pricing table | [F8](../features/f8-product-deep-dive.md) | 2026-03-24 |
| T39 | Display per-host ratings with accent colors | [F8](../features/f8-product-deep-dive.md) | 2026-03-24 |
| T40 | Wire modal to open from product cards | [F8](../features/f8-product-deep-dive.md) | 2026-03-24 |

---

## How to Add a Task

Claude adds tasks using this format:

```
| T[N] | `[ ]` | [What needs to be done — specific and actionable] | [context/features/feature-name.md](../features/feature-name.md) | [any notes] |
```

Rules:
- One task = one clear, completable action
- Link to the feature file if the task belongs to a feature
- Tasks that span multiple features get a note explaining the dependency
- "Implement @auth" is too vague — "Build login form with email/password validation" is a task
- When a task is done, move it to Completed — never delete tasks

---

## Task States

| Symbol | Meaning | When to use |
|--------|---------|-------------|
| `[ ]` | Todo | Not started |
| `[~]` | In progress | Currently being worked on |
| `[x]` | Done | Completed and verified |
| `[-]` | Blocked | Waiting on something else |
| `[>]` | Deferred | Decided to push to later phase |

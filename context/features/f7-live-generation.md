# Feature: Live Episode Generation (Demo WOW Moment)

> **Status:** `draft`
> **Phase:** v1 (Phase 2)
> **Last updated:** 2026-03-24

---

## Summary

Users watch their episode being built in real-time via SSE. Shows step-by-step progress, live URL display during Firecrawl scraping, product cards that pop in as scraped, and timing stats. This is the key demo moment showing Firecrawl's power.

---

## Users

All users during their first episode generation. The transition screen between Vibe Setup and Player.

---

## User Stories

- As a **listener**, I want to watch my episode being built so I feel the AI working for me
- As a **hackathon judge**, I want to see Firecrawl URLs streaming in real-time so I understand the scraping depth
- As a **listener**, I want to see product cards appear one by one so I get excited about what's coming

---

## Behaviour

### Happy Path

1. User clicks "Start Listening" from Vibe Setup
2. Frontend connects to SSE endpoint (`GET /api/generate/progress`)
3. Backend starts pipeline, emits events at each stage:
   - `scraping_ph` → show "Scanning Product Hunt..."
   - `product_found` → product card pops in
   - `scraping_website` → show live URL being scraped
   - `website_scraped` → product card enriched with website data
   - `generating_script` → show "Writing the episode..."
   - `synthesizing_voice` → show "Recording Aero..." / "Recording Nova..."
   - `stitching_audio` → show "Mixing the episode..."
   - `complete` → auto-transition to Player
4. Product cards accumulate in a grid as they're scraped
5. Current step highlighted in a progress indicator

### Edge Cases & Rules
- If SSE connection drops, auto-reconnect
- If generation fails, show error with "Try Again" button
- Progress should feel fast — aim for < 3 minutes total visible time

---

## Connections

- **Depends on:** F1, F2, F3, F4 (full pipeline)
- **Triggers:** F5 (Player) when complete
- **SSE from:** Backend pipeline orchestrator

---

## MVP vs Full Version

| Aspect | MVP (v1) | Full Version |
|--------|----------|--------------|
| Progress | Step indicator + URL display | Animated transitions, timing stats |
| Product cards | Basic name + tagline | Thumbnails, upvote counts |
| Stats | None | Credit usage, generation time |

---

## Security Considerations

- SSE endpoint is public (no auth) — only emits progress for the current generation
- No sensitive data in SSE events

## Tasks

| Task # | Status | What needs to be done |
|--------|--------|-----------------------|
| T29 | `[ ]` | Implement SSE endpoint in FastAPI for generation progress |
| T30 | `[ ]` | Emit SSE events from each pipeline stage |
| T31 | `[ ]` | Build Generation screen with step indicator |
| T32 | `[ ]` | Build live URL display component |
| T33 | `[ ]` | Build product card grid that populates as products are scraped |
| T34 | `[ ]` | Wire auto-transition to Player on `complete` event |
| T35 | `[ ]` | Add useSSE custom hook for EventSource management |

---

## User Acceptance Tests

**UAT Status:** `pending`

**Last tested:** —

**Outcome:** —

## Open Questions

- [ ] Should generation be triggered by the frontend or auto-start on schedule?

---

## Notes

- This screen is the Firecrawl showcase — the live URL scraping must be visually prominent
- Animation and transitions matter here — it should feel alive

---

## Archive

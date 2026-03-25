# Feature: Trend Radar (Weekly Intelligence)

> **Status:** `draft`
> **Phase:** v1.1 (Phase 3 — if time allows)
> **Last updated:** 2026-03-24

---

## Summary

Aggregated view across the past week's episodes showing trending product categories, Aero's Picks vs Nova's Picks, host agreement rate, and links to the biggest disagreements.

---

## Users

Returning listeners who want a weekly summary of trends in the PH ecosystem.

---

## User Stories

- As a **listener**, I want to see trending categories so I know what's hot this week
- As a **listener**, I want to see Aero's Picks vs Nova's Picks so I get curated recommendations
- As a **listener**, I want to click through to the biggest host disagreement so I hear the debate

---

## Behaviour

### Happy Path

1. User navigates to Trend Radar page
2. System aggregates data from past 7 days of episodes
3. Shows: trending categories with growth %, Aero's top picks, Nova's top picks
4. Shows host agreement rate (% of products where ratings differ by < 2 points)
5. Highlights the biggest disagreement of the week with a link to that segment

### Edge Cases & Rules
- Requires at least 3 episodes to show meaningful trends
- Categories auto-detected from product tags/descriptions
- If < 3 episodes, show "Come back after a few more episodes for trends"

---

## Connections

- **Depends on:** Multiple episodes in storage
- **Links to:** F5 (player) for segment playback

---

## MVP vs Full Version

| Aspect | MVP (v1.1) | Full Version |
|--------|----------|--------------|
| Time range | 7 days | Configurable (7/14/30 days) |
| Categories | Auto-detected | User-defined categories |
| Visualization | Simple lists | Charts and graphs |

---

## Security Considerations

- None significant — aggregated public data

## Tasks

| Task # | Status | What needs to be done |
|--------|--------|-----------------------|
| T46 | `[>]` | Build trend aggregation service (7-day lookback) |
| T47 | `[>]` | Build Trend Radar page layout |
| T48 | `[>]` | Implement host picks and agreement rate calculation |
| T49 | `[>]` | Link disagreement highlights to specific episode segments |

---

## User Acceptance Tests

**UAT Status:** `pending`

**Last tested:** —

**Outcome:** —

## Open Questions

- [ ] How to auto-detect product categories from unstructured PH data?

---

## Notes

- P1 feature — only build if Phase 1 and 2 are complete
- Requires multiple episodes to be useful — may not demo well at hackathon

---

## Archive

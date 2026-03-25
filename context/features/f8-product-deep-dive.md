# Feature: Product Deep Dive

> **Status:** `draft`
> **Phase:** v1 (Phase 2)
> **Last updated:** 2026-03-24

---

## Summary

A modal that shows the full Firecrawl analysis for each product: side-by-side comparison of PH blurb vs actual website findings, extracted features, pricing, and per-host ratings. Shows the depth of Firecrawl's web analysis.

---

## Users

Listeners who want more detail about a specific product discussed in the episode.

---

## User Stories

- As a **listener**, I want to see what Firecrawl actually found vs the PH blurb so I understand the real product
- As a **listener**, I want to see per-host ratings side by side so I can see where Aero and Nova disagree
- As a **listener**, I want to see pricing information so I know if the product fits my budget

---

## Behaviour

### Happy Path

1. User taps a product card in show notes or generation viewer
2. Modal opens with cached product data (instant — no new API call)
3. Side-by-side: "What Product Hunt says" vs "What Firecrawl found"
4. Sections: Features, Pricing, Target Audience, Tech Stack
5. Per-host ratings: Aero (orange) X/10 vs Nova (purple) Y/10
6. External links: Visit product site, View on Product Hunt

### Edge Cases & Rules
- If website scrape failed, show "Website data unavailable" with PH data only
- At least 3 data categories should be extracted per product
- Pricing table rendered from extracted markdown

---

## Connections

- **Depends on:** F1, F2 (product data), F3 (host ratings)
- **Shares data with:** F5 (triggered from player show notes)
- **Future:** CTA "Ask Aero & Nova about this" → F9 (Live Mode)

---

## MVP vs Full Version

| Aspect | MVP (v1) | Full Version |
|--------|----------|--------------|
| Data | Cached from generation | Live re-scrape option |
| Comparison | Side-by-side text | Visual diff highlighting |
| Competitive | None | Firecrawl searches for alternatives |

---

## Security Considerations

- Scraped website content must be sanitized before rendering as HTML to prevent XSS

## Tasks

| Task # | Status | What needs to be done |
|--------|--------|-----------------------|
| T36 | `[ ]` | Build Product Deep Dive modal layout |
| T37 | `[ ]` | Implement PH vs Firecrawl side-by-side comparison |
| T38 | `[ ]` | Render extracted pricing table |
| T39 | `[ ]` | Display per-host ratings with accent colors |
| T40 | `[ ]` | Wire modal to open from product cards in Player and Generation screens |

---

## User Acceptance Tests

**UAT Status:** `pending`

**Last tested:** —

**Outcome:** —

## Open Questions

- [ ] How should markdown content from Firecrawl be rendered safely in the frontend?

---

## Notes

- Key differentiator feature — this shows why deep scraping matters vs just reading PH blurbs

---

## Archive

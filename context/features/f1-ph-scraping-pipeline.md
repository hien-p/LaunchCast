# Feature: Product Hunt Scraping Pipeline

> **Status:** `draft`
> **Phase:** v1 (Phase 1)
> **Last updated:** 2026-03-24

---

## Summary

Firecrawl scrapes Product Hunt's daily top launches page, extracting product names, taglines, maker info, upvote counts, rankings, descriptions, and links to each product's actual website. This is the first stage of the episode generation pipeline.

---

## Users

The system itself — this is an automated backend pipeline. No direct user interaction, but results are visible in the Generation Viewer (F7) and Player (F5).

---

## User Stories

- As the **system**, I need to retrieve today's top 5-10 PH launches so that the podcast has fresh content daily
- As a **listener**, I want to hear about today's top launches so I stay informed without browsing PH

---

## Behaviour

### Happy Path

1. Pipeline triggered (manual or cron)
2. Firecrawl Search API called with `site:producthunt.com/posts` query, filtered to today
3. Results parsed into structured product list (name, tagline, URL, upvotes, description)
4. Product list returned as JSON array for the next pipeline stage (F2)

### Edge Cases & Rules
- If Firecrawl returns fewer than 5 results, proceed with what's available
- If Firecrawl fails entirely, return error and halt pipeline
- PH page structure changes should be handled gracefully (Firecrawl's markdown output is more resilient than DOM scraping)
- Results are cached — re-triggering same day reuses cached data unless forced

---

## Connections

- **Triggers:** F2 (Deep Product Website Analysis)
- **Consumed by:** F3 (Script Generation), F7 (Generation Viewer via SSE)

---

## MVP vs Full Version

| Aspect | MVP (v1) | Full Version |
|--------|----------|--------------|
| Data source | Firecrawl Search API | PH API/RSS + Firecrawl fallback |
| Product count | Top 5-10 | Configurable |
| Schedule | Manual trigger | Daily 6 AM cron |
| Caching | JSON files | SQLite + TTL cache |

---

## Security Considerations

- Firecrawl API key must not be exposed to frontend — all scraping happens server-side
- No user input is involved in this pipeline stage

## Tasks

| Task # | Status | What needs to be done |
|--------|--------|-----------------------|
| T1 | `[ ]` | Set up FastAPI backend project structure with requirements.txt |
| T2 | `[ ]` | Implement Firecrawl PH scraping service (search + parse) |
| T3 | `[ ]` | Create `/api/generate` endpoint that triggers the pipeline |
| T4 | `[ ]` | Add JSON file caching for scraped PH data |

---

## User Acceptance Tests

**UAT Status:** `pending`

**Last tested:** —

**Outcome:** —

## Open Questions

- [ ] Does Firecrawl Search API reliably return today-only PH results with `tbs: "qdr:d"`?
- [ ] What's the fallback if PH blocks or changes their page structure?

---

## Notes

- Firecrawl credit budget: ~2 credits for PH search + ~10 for individual product pages
- Total scraping pipeline (F1 + F2) should complete in < 30 seconds

---

## Archive

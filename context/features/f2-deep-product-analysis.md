# Feature: Deep Product Website Analysis

> **Status:** `draft`
> **Phase:** v1 (Phase 1)
> **Last updated:** 2026-03-24

---

## Summary

For each product scraped from Product Hunt, Firecrawl visits the actual product website and extracts the real product pitch, features, pricing, tech stack indicators, and target audience signals. This gives the podcast hosts real depth beyond the PH blurb.

---

## Users

Automated pipeline stage. Results surface in the podcast script, product deep dive modals (F8), and generation viewer (F7).

---

## User Stories

- As a **listener**, I want to hear what the product actually offers (not just the PH blurb) so I can make informed judgments
- As the **script generator**, I need rich website content to create meaningful host commentary

---

## Behaviour

### Happy Path

1. Receives product list from F1
2. For each product, Firecrawl scrapes the product website URL
3. Extracts: main content (markdown), pricing info, feature list, target audience
4. Returns enriched product data as JSON

### Edge Cases & Rules
- If a product website fails to scrape (paywall, SPA, timeout), use PH blurb only and flag it
- Parallel scraping (up to 5 concurrent) to stay within time budget
- Total deep-scrape pipeline should complete in < 2 minutes for 10 products
- 80%+ success rate target for product website scraping

---

## Connections

- **Depends on:** F1 (PH Scraping Pipeline)
- **Triggers:** F3 (Script Generation)
- **Consumed by:** F8 (Product Deep Dive modal)

---

## MVP vs Full Version

| Aspect | MVP (v1) | Full Version |
|--------|----------|--------------|
| Extraction | Main content markdown | Structured pricing tables, tech stack detection |
| Concurrency | Sequential or 5 parallel | Configurable |
| Fallback | PH blurb only | Retry with different Firecrawl options |

---

## Security Considerations

- All scraping is server-side — no user-controlled URLs in v1
- Scraped content is sanitized before rendering in frontend

## Tasks

| Task # | Status | What needs to be done |
|--------|--------|-----------------------|
| T5 | `[ ]` | Implement deep scrape service (Firecrawl per product URL) |
| T6 | `[ ]` | Add parallel scraping with concurrency limit |
| T7 | `[ ]` | Handle scrape failures gracefully (fallback to PH blurb) |

---

## User Acceptance Tests

**UAT Status:** `pending`

**Last tested:** —

**Outcome:** —

## Open Questions

- [ ] What Firecrawl scrape options work best for product sites? (`onlyMainContent`, formats)

---

## Notes

- ~10 Firecrawl credits per day for deep scraping (1 per product)

---

## Archive

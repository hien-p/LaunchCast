# Feature: Podcast Script Generation

> **Status:** `draft`
> **Phase:** v1 (Phase 1)
> **Last updated:** 2026-03-24

---

## Summary

Claude API synthesizes the scraped product data into a natural podcast conversation between two hosts: Aero (skeptic) and Nova (optimist). Each product gets an intro, deep dive, and hot take with independent numeric ratings. Disagreements are highlighted.

---

## Users

Automated pipeline stage. Output consumed by F4 (voice synthesis) and displayed in F5 (player show notes).

---

## User Stories

- As a **listener**, I want to hear natural, opinionated commentary so the podcast is engaging and not robotic
- As a **listener**, I want to see when hosts disagree so I know which products sparked real debate

---

## Behaviour

### Happy Path

1. Receives enriched product data from F1 + F2
2. Sends to Claude API with system prompt defining Aero and Nova personas
3. Claude generates structured script as JSON array of ScriptLine objects
4. Script validated for format, then passed to F4

### Script Structure Per Product
1. Quick intro (name, what it does, ~10 seconds)
2. Deep dive (what PH says vs what the website reveals)
3. Hot take — each host gives their take + numeric rating (1-10)
4. Disagreements highlighted naturally in dialogue

### Script Structure Overall
- Episode intro (hosts greet, preview today's lineup)
- Product segments (1-3 minutes each)
- Episode outro (recap, sign-off)

### Edge Cases & Rules
- If a product had a failed website scrape, hosts acknowledge it: "we couldn't access their site"
- Minimum 2 disagreements per episode to keep it interesting
- Total script should produce 10-20 minutes of audio
- User preferences from Vibe Setup (interests, technical detail) influence the script via prompt

---

## Connections

- **Depends on:** F1, F2 (product data)
- **Consumed by:** F4 (voice synthesis), F5 (show notes)
- **Influenced by:** F6 (Vibe Setup preferences)

---

## MVP vs Full Version

| Aspect | MVP (v1) | Full Version |
|--------|----------|--------------|
| LLM | Claude Sonnet | Configurable (Claude/GPT-4) |
| Personalization | Basic topic interest weighting | Full preference-driven script customization |
| Few-shot examples | None | Curated examples of great banter |

---

## Security Considerations

- Anthropic API key server-side only
- Scraped content is passed as context to LLM — sanitize to prevent prompt injection from product websites

## Tasks

| Task # | Status | What needs to be done |
|--------|--------|-----------------------|
| T8 | `[ ]` | Design Aero/Nova system prompt with persona definitions |
| T9 | `[ ]` | Implement script generation service (Claude API call + JSON parsing) |
| T10 | `[ ]` | Add ScriptLine validation (format, speaker names, types) |
| T11 | `[ ]` | Integrate Vibe Setup preferences into prompt context |

---

## User Acceptance Tests

**UAT Status:** `pending`

**Last tested:** —

**Outcome:** —

## Open Questions

- [ ] How many few-shot examples improve script quality without inflating token cost?
- [ ] Should script generation be streamed or wait for complete response?

---

## Notes

- ~$0.05 per episode in Claude API costs (~5k output tokens)
- System prompt is critical to quality — iterate aggressively

---

## Archive

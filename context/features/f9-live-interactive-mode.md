# Feature: Live Interactive Mode (Voice Chat with Hosts)

> **Status:** `draft`
> **Phase:** v1.1 (Phase 3 — if time allows)
> **Last updated:** 2026-03-24

---

## Summary

Users voice-chat with Aero & Nova in real-time using ElevenAgents. They can ask follow-up questions about products, request live comparisons, and see Firecrawl searching product websites live in the transcript. Context panel auto-updates with structured data.

---

## Users

Engaged listeners who want deeper information about specific products.

---

## User Stories

- As a **listener**, I want to ask follow-up questions about a product so I get the specific info I need
- As a **listener**, I want to see Firecrawl searching live so I understand where the answers come from
- As a **listener**, I want both hosts to respond in character so the interaction feels natural

---

## Behaviour

### Happy Path

1. User clicks "Talk to Hosts" button
2. ElevenAgents session starts with episode context loaded
3. User speaks a question → ASR transcribes
4. If answer is in episode context → direct response from hosts
5. If more info needed → Firecrawl Server Tool searches the product website live
6. Search progress visible in transcript (shows URL being crawled)
7. Response synthesized by ElevenAgents TTS → user hears voice response
8. Context panel updates with structured data (pricing tables, comparison data)

### Edge Cases & Rules
- Sub-second voice response latency target
- Both hosts respond in character (Aero skeptical, Nova optimistic)
- If product site unreachable, graceful fallback with "I couldn't access that site"
- Session has access to full episode product data as context

---

## Connections

- **Depends on:** F4 (episode context), F8 (can be launched from deep dive)
- **Uses:** ElevenAgents SDK, Firecrawl as Server Tool

---

## MVP vs Full Version

| Aspect | MVP (v1.1) | Full Version |
|--------|----------|--------------|
| Voice | ElevenAgents with 2 voices | Custom fine-tuned voices |
| Search | Single product at a time | Multi-product comparison |
| Context | Current episode only | Cross-episode memory |

---

## Security Considerations

- User voice input is processed by ElevenAgents — no local storage of audio
- Firecrawl searches are server-side only
- Rate limit voice chat sessions to prevent API abuse

## Tasks

| Task # | Status | What needs to be done |
|--------|--------|-----------------------|
| T41 | `[>]` | Set up ElevenAgents with Aero & Nova personas |
| T42 | `[>]` | Configure Firecrawl as ElevenAgents Server Tool |
| T43 | `[>]` | Build voice chat UI with transcript |
| T44 | `[>]` | Build context panel that updates with search results |
| T45 | `[>]` | Add visible URL display during live Firecrawl searches |

---

## User Acceptance Tests

**UAT Status:** `pending`

**Last tested:** —

**Outcome:** —

## Open Questions

- [ ] ElevenAgents pricing for real-time voice chat sessions?
- [ ] Can both hosts speak in the same session, or one at a time?

---

## Notes

- P1 feature — only build if Phase 1 and 2 are complete
- This is the demo highlight for hackathon judges

---

## Archive

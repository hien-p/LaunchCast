# Feature: Voice Synthesis & Audio Delivery

> **Status:** `draft`
> **Phase:** v1 (Phase 1)
> **Last updated:** 2026-03-24

---

## Summary

ElevenLabs converts the podcast script into a two-voice podcast. Each script line is synthesized with the appropriate voice (Aero or Nova), then FFmpeg stitches all clips into a single MP3 episode with natural pauses between turns.

---

## Users

Automated pipeline stage. Output is the final MP3 file served by the web player (F5).

---

## User Stories

- As a **listener**, I want high-quality, natural-sounding voices so the podcast feels real
- As a **listener**, I want distinct voices for each host so I can tell Aero and Nova apart

---

## Behaviour

### Happy Path

1. Receives script (ScriptLine array) from F3
2. For each line, calls ElevenLabs TTS with the appropriate voice ID
3. Audio clips saved as temporary WAV/MP3 files
4. FFmpeg concatenates clips in script order with ~300ms pauses between speakers
5. Audio levels normalized
6. Output as single MP3 file (128kbps)
7. Episode saved to filesystem + metadata to SQLite

### Edge Cases & Rules
- Generate clips sequentially to avoid ElevenLabs rate limits
- If a clip fails, retry once with backoff; if still fails, skip line and note in metadata
- Total audio generation < 3 minutes for a 15-minute episode
- Voice IDs are configured via environment variables

---

## Connections

- **Depends on:** F3 (script)
- **Consumed by:** F5 (web player), F7 (generation progress SSE)

---

## MVP vs Full Version

| Aspect | MVP (v1) | Full Version |
|--------|----------|--------------|
| Music bed | None | Royalty-free intro/outro music |
| Audio processing | Basic concat + normalize | Dynamic ducking, crossfades |
| Voice selection | Fixed two voices | User-selectable voices |
| Output format | MP3 only | MP3 + RSS-compatible format |

---

## Security Considerations

- ElevenLabs API key server-side only
- Generated audio files served from backend; no direct filesystem path exposure

## Tasks

| Task # | Status | What needs to be done |
|--------|--------|-----------------------|
| T12 | `[ ]` | Select and configure ElevenLabs voice IDs for Aero and Nova |
| T13 | `[ ]` | Implement TTS service (script line → audio clip via ElevenLabs) |
| T14 | `[ ]` | Implement audio stitcher (FFmpeg: clips → single MP3 with pauses) |
| T15 | `[ ]` | Save episode metadata to SQLite and audio file to filesystem |
| T16 | `[ ]` | Create audio serving endpoint (`GET /api/episodes/{date}/audio`) |

---

## User Acceptance Tests

**UAT Status:** `pending`

**Last tested:** —

**Outcome:** —

## Open Questions

- [ ] Which specific ElevenLabs voices work best for Aero (dry/analytical) and Nova (warm/upbeat)?
- [ ] Should we add intro/outro music in v1 or defer?

---

## Notes

- FFmpeg must be installed on the system (available on Railway/Render)
- ElevenLabs free tier: check monthly character limits

---

## Archive

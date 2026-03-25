# Feature: Web Player & Episode Archive

> **Status:** `draft`
> **Phase:** v1 (Phase 2)
> **Last updated:** 2026-03-24

---

## Summary

A React web player where users listen to today's episode, browse past episodes, see show notes with product links, and share episodes. Mobile-first with a sticky bottom player bar.

---

## Users

All listener personas (vibe coders, startup founders, tech curious). Used after episode generation is complete.

---

## User Stories

- As a **listener**, I want to play today's episode instantly so I can start listening without friction
- As a **listener**, I want to see which products are discussed with links so I can check them out
- As a **listener**, I want to tap a product name and jump to that segment in the audio
- As a **listener**, I want to browse past episodes to catch up on what I missed

---

## Behaviour

### Happy Path

1. User opens the app → fetches latest episode from API
2. Player loads with episode title, duration, and show notes
3. User hits play → audio streams
4. Show notes display product cards with names, taglines, upvotes, host ratings
5. Tapping a product card seeks to that product's segment in the audio
6. Scrolling down shows past episodes list

### Edge Cases & Rules
- If no episode exists yet, show empty state with "Generate" CTA
- Segmented progress bar colored by product (visual marker of segments)
- Per-host ratings displayed with accent colors (Aero orange, Nova purple)

---

## Connections

- **Depends on:** F4 (audio file), F3 (script/product data)
- **Consumed by:** F8 (Product Deep Dive opens from product cards)

---

## MVP vs Full Version

| Aspect | MVP (v1) | Full Version |
|--------|----------|--------------|
| Player | Basic HTML5 audio with custom UI | Waveform visualization |
| Archive | Simple list | Search + filter |
| Sharing | Copy link | OG images, Twitter cards |
| Playback | 1x only | Speed controls (1x, 1.5x, 2x) |

---

## Security Considerations

- None significant — public audio content, no user data

## Tasks

| Task # | Status | What needs to be done |
|--------|--------|-----------------------|
| T17 | `[ ]` | Set up React + Vite frontend project structure |
| T18 | `[ ]` | Build audio player component with play/pause/seek |
| T19 | `[ ]` | Build show notes component with product cards |
| T20 | `[ ]` | Implement segment seek (tap product → jump to timestamp) |
| T21 | `[ ]` | Build episode archive list |
| T22 | `[ ]` | Add sticky mobile player bar |
| T23 | `[ ]` | Create API client for fetching episodes |

---

## User Acceptance Tests

**UAT Status:** `pending`

**Last tested:** —

**Outcome:** —

## Open Questions

- [ ] Auto-play on page load for demo impact, or require user click?

---

## Notes

- Mobile-first layout — max width 768px
- Dark mode default matching design system

---

## Archive

# Feature: Vibe Setup (Personalized Onboarding)

> **Status:** `draft`
> **Phase:** v1 (Phase 1)
> **Last updated:** 2026-03-24

---

## Summary

First screen users see. They select interest topics, toggle preferences, meet the hosts (Aero + Nova), preview their voices, and launch episode generation. Preferences stored in localStorage and sent to the backend for personalized script generation.

---

## Users

All first-time visitors. Returning users can access from settings to modify preferences.

---

## User Stories

- As a **first-time visitor**, I want to personalize my podcast in < 10 seconds so I feel invested before listening
- As a **listener**, I want to hear a voice preview so I know what the hosts sound like
- As a **listener**, I want to select my interests so the podcast feels relevant to me

---

## Behaviour

### Happy Path

1. User lands on app → Vibe Setup screen
2. Select interest tags (Open Source, LLMs, Frontend Tools, Indie SaaS, Backends, UI/UX Design)
3. Toggle "Deep Dives Only" and "Technical Detail" preferences
4. See host bios: Aero (skeptic) and Nova (optimist) with personality descriptions
5. Click "Preview Voice" to hear a 10-second sample of each host
6. Click "Start Listening to Today's Hunt" → transitions to Generation screen (F7)

### Edge Cases & Rules
- At least one interest must be selected
- Preferences saved to localStorage on every change
- Voice preview uses a pre-generated 10-second clip (not generated on the fly)
- Returning users skip to Player unless they access Setup from settings

---

## Connections

- **Triggers:** F7 (Live Generation), F3 (preferences influence script)
- **Shares data with:** F3 (user preferences passed to script generation prompt)

---

## MVP vs Full Version

| Aspect | MVP (v1) | Full Version |
|--------|----------|--------------|
| Interests | 6 fixed categories | Auto-detected from PH categories |
| Persistence | localStorage only | Server-side with user accounts |
| Voice preview | Static audio file | Dynamic from today's intro |
| Host customization | Fixed personas | Custom personality sliders |

---

## Security Considerations

- No sensitive data — preferences are non-personal topic selections
- localStorage only; no server-side user data in v1

## Tasks

| Task # | Status | What needs to be done |
|--------|--------|-----------------------|
| T24 | `[ ]` | Build Vibe Setup screen layout (interest tags, toggles, host bios) |
| T25 | `[ ]` | Implement interest tag selector with localStorage persistence |
| T26 | `[ ]` | Add host bio cards with Aero/Nova personality descriptions |
| T27 | `[ ]` | Add voice preview button (plays static audio sample) |
| T28 | `[ ]` | Wire CTA button to trigger generation and navigate to Generation screen |

---

## User Acceptance Tests

**UAT Status:** `pending`

**Last tested:** —

**Outcome:** —

## Open Questions

- [ ] Where do the 10-second voice preview clips come from before any episode is generated?

---

## Notes

- This is the first screen judges see in the hackathon demo
- Must look polished and feel instant

---

## Archive

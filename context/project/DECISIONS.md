# Architecture Decision Log

> Log significant decisions here as they are made.
> Never delete entries — add a "superseded by" note instead.

---

**Decision:** Use React + Vite for frontend instead of Next.js
**Date:** 2026-03-24
**Context:** Need a frontend framework for the web player and generation UI
**Options Considered:** Next.js (SSR, routing), React + Vite (lightweight SPA), Svelte
**Rationale:** LaunchCast is a client-heavy SPA with no SEO needs for v1. Vite is faster to prototype. ElevenLabs React SDK works naturally with Vite. No server-side rendering needed — audio playback and SSE consumption are purely client-side.
**Consequences:** No built-in SSR if needed later; would need to migrate or add a meta framework.

---

**Decision:** ~~Use Python + FastAPI for backend~~ **Superseded — see below**
**Date:** 2026-03-24
**Context:** Originally planned Python backend
**Superseded by:** TypeScript + Express decision below

---

**Decision:** Use TypeScript + Express for backend instead of Python + FastAPI
**Date:** 2026-03-24
**Context:** User requested TypeScript for both frontend and backend
**Options Considered:** Python + FastAPI, TypeScript + Express, TypeScript + Hono
**Rationale:** Same language across the whole stack enables shared types, faster iteration, and a single toolchain. Firecrawl, Anthropic, and ElevenLabs all have JS/TS SDKs. Express handles SSE streaming well.
**Consequences:** Unified TypeScript codebase. Can share type definitions between frontend and backend. better-sqlite3 used instead of Python sqlite3.

---

**Decision:** Use SQLite + JSON files for storage instead of Postgres or a cloud DB
**Date:** 2026-03-24
**Context:** Need to store episodes, product data, and scripts
**Options Considered:** PostgreSQL, Supabase, Firebase, SQLite + JSON
**Rationale:** Zero infrastructure setup. Single-file database travels with the project. Episodes are append-only (one per day) — no complex queries needed. JSON files provide easy debugging and caching of intermediate pipeline outputs.
**Consequences:** No concurrent write support. Would need to migrate to Postgres for production scale.

---

**Decision:** No user authentication in v1
**Date:** 2026-03-24
**Context:** Need to decide if users log in to listen
**Options Considered:** Email auth, OAuth, no auth
**Rationale:** LaunchCast delivers public podcast content. User preferences (Vibe Setup) are stored in localStorage. No need for accounts until personalized server-side features are added. Reduces complexity significantly for hackathon.
**Consequences:** Can't persist user preferences across devices. No analytics per user.

---

**Decision:** Two distinct AI hosts (Aero skeptic + Nova optimist) with independent ratings
**Date:** 2026-03-24
**Context:** Podcast format design
**Options Considered:** Single narrator, two agreeable hosts, two contrasting hosts
**Rationale:** Debate format between a skeptic and an optimist creates natural tension and engagement. Independent ratings (1-10) create highlights when hosts disagree — these are the most shareable moments. Distinct personalities make the podcast feel real.
**Consequences:** Script generation is more complex (must maintain two consistent personas). Voice synthesis needs two distinct voice IDs.

---

**Decision:** SSE for live generation progress instead of WebSockets
**Date:** 2026-03-24
**Context:** Frontend needs real-time updates during episode generation
**Options Considered:** WebSockets, SSE, polling
**Rationale:** Generation progress is one-way (server → client). SSE is simpler to implement with FastAPI, works over standard HTTP, auto-reconnects, and doesn't require a WebSocket library. No bidirectional communication needed.
**Consequences:** Can't send client messages back through the same connection. Would need WebSockets if interactive features require bidirectional real-time communication.

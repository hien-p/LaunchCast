# LaunchCast - Code Standards & Conventions

## Language & Runtime

- **TypeScript** across full stack (backend + frontend)
- **Strict mode** enabled in all tsconfig files
- **ES2022** target (backend), **ESNext** module resolution
- **Path aliases:** `@/*` maps to `src/*` in backend

---

## Backend Conventions

### Project Structure

```
backend/src/
├── index.ts          # App bootstrap, middleware, route mounting
├── config.ts         # Centralized env config with defaults
├── models/
│   └── types.ts      # All shared interfaces and type factories
├── routes/
│   ├── episodes.ts   # Episode CRUD endpoints
│   └── generate.ts   # Generation trigger + SSE endpoints
└── services/
    ├── pipeline.ts       # Workflow orchestrator
    ├── scraper.ts        # Data extraction
    ├── scriptGenerator.ts # LLM interaction
    ├── voiceSynthesizer.ts # TTS
    ├── audioStitcher.ts  # FFmpeg operations
    └── database.ts       # Persistence
```

### Patterns

- **Layered architecture:** Routes -> Services -> Models
- **One service per external API:** Each service owns exactly one integration
- **Pipeline as orchestrator:** `pipeline.ts` coordinates services, never calls external APIs directly
- **Factory functions for defaults:** `createProduct(partial)` ensures all fields have defaults
- **Date-based IDs:** Episode IDs are `YYYY-MM-DD` strings
- **JSON serialization for complex fields:** Products and scripts stored as JSON strings in SQLite

### Route Conventions

- All routes prefixed with `/api/`
- Date parameters validated with regex: `/^\d{4}-\d{2}-\d{2}$/`
- PH URLs validated: `/^https?:\/\/(www\.)?producthunt\.com\/posts\/[\w-]+$/`
- Responses are JSON with `{ error: string }` on failure
- Audio endpoints support HTTP Range headers for seeking

### Service Conventions

- Services export standalone functions (not classes)
- Async functions throughout
- Progress callbacks via `onEvent?: (event: SSEEvent) => void` pattern
- Rate limiting: 200ms delay between ElevenLabs API calls
- Concurrency control: Website deep scraping limited to 5 concurrent requests
- Caching: Daily PH data cached to JSON files to avoid redundant scraping

### Error Handling

- Routes: try-catch with appropriate HTTP status codes
- Services: throw on critical failures, degrade gracefully on non-critical
- Pipeline: catches per-stage errors, emits SSE error events
- Voice synthesis: skips failed lines rather than aborting
- Database: JSON parse failures default to empty arrays

---

## Frontend Conventions

### Project Structure

```
frontend/src/
├── main.tsx            # React entry, no logic
├── App.tsx             # Top-level state machine (3 screens)
├── index.css           # Tailwind + design tokens (CSS variables)
├── screens/            # Full-page views (one per screen state)
├── components/         # Feature-specific composed components
│   └── ui/             # Reusable headless/primitive UI components
├── hooks/              # Custom React hooks
├── lib/                # Utilities, API client, types
└── assets/             # Static images
```

### Component Patterns

- **Screens** are full-page views corresponding to app states (`setup`, `generating`, `player`)
- **Components** are feature-specific (ProductCard, ProductDeepDive)
- **UI components** (`components/ui/`) are generic, reusable primitives
- **Compound component pattern** for complex UI (AudioPlayer, TranscriptViewer, ScrubBar):
  - Provider wraps children with React Context
  - Sub-components consume context via custom hooks
  - Example: `AudioPlayerProvider` > `AudioPlayerButton` + `AudioPlayerProgress` + `AudioPlayerTime`

### State Management

| Scope | Pattern |
|-------|---------|
| App routing | `useState` in App.tsx (screen state machine) |
| User preferences | Custom hook (`usePreferences`) with localStorage |
| SSE events | Custom hook (`useSSE`) with accumulated event array |
| Audio playback | React Context (`AudioPlayerProvider`) |
| Component-local | `useState` / `useRef` within each component |

No global state library. State flows down via props and context.

### Styling

- **Tailwind CSS v4** with `@tailwindcss/vite` plugin
- **CSS custom properties** for design tokens (defined in `index.css :root`)
- **Dark mode only** - no light mode toggle
- **class-variance-authority (CVA)** for component variant styling
- **tailwind-merge** via `cn()` utility for conditional class merging
- **Motion library** (Framer Motion fork) for animations
- Font: **Geist Variable** via `@fontsource-variable/geist`

### API Integration

- **Vite dev proxy:** `/api` requests proxied to `http://localhost:8000/api`
- **REST:** Standard fetch calls via helper functions in `lib/api.ts`
- **SSE:** `EventSource` wrapped in `useSSE` hook with auto-cleanup
- **Audio streaming:** HTML `<audio>` element pointing to `/api/episodes/:date/audio`

### TypeScript

- Interfaces defined in `lib/types.ts` (mirrors backend types)
- Props interfaces co-located with components
- No `any` types
- Strict null checks enabled

---

## Shared Conventions

### Naming

| Entity | Convention | Example |
|--------|-----------|---------|
| Files | camelCase (services, hooks), PascalCase (components) | `scraper.ts`, `PlayerScreen.tsx` |
| Interfaces | PascalCase | `Product`, `ScriptLine` |
| Functions | camelCase | `generateScript`, `scrapeProductHunt` |
| Constants | UPPER_SNAKE (env), camelCase (local) | `DATABASE_PATH`, `defaultPreferences` |
| CSS variables | kebab-case | `--color-aero`, `--font-sans` |
| Routes | kebab-case | `/api/generate/start` |
| Event types | snake_case | `product_found`, `scraping_website` |

### Git

- Conventional-style commit messages
- Main branch: `main`
- No branch protection (hackathon)

### Dependencies

- **No test framework** configured (hackathon scope)
- **No CI/CD pipeline** configured
- **ESLint** configured for frontend (React plugins)
- **No Prettier** - relies on editor formatting
- Build: `tsx` for backend dev, `vite build` for frontend production

### Scripts

**Backend (`package.json`):**
- `npm run dev` - Start with tsx watch mode
- `npm run build` - TypeScript compile
- `npm start` - Run compiled JS

**Frontend (`package.json`):**
- `npm run dev` - Vite dev server (port 5173)
- `npm run build` - Production build
- `npm run preview` - Preview production build

---

## Anti-Patterns to Avoid

- No `as any` or `@ts-ignore` - fix the types instead
- No commented-out code - delete it
- No classes for services - use exported functions
- No global mutable state - use React Context or hook patterns
- No direct DOM manipulation - use React refs
- No synchronous file I/O in request handlers
- No hardcoded API keys - use environment variables
- No concurrent episode generation - single-lock enforced

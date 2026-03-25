# Code Conventions

> Claude follows these on every task without being reminded.

## Naming

### Python (Backend)
- Files: `snake_case.py`
- Functions/variables: `snake_case`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- FastAPI routers: `router = APIRouter(prefix="/api/...")`

### TypeScript/React (Frontend)
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utilities: `camelCase.ts`
- Constants: `UPPER_SNAKE_CASE`
- CSS classes: Tailwind utilities (no custom CSS files unless necessary)

## File & Folder Structure

```
backend/
  app/
    main.py              # FastAPI app entry point
    routers/             # API route handlers
    services/            # Business logic (scraping, script gen, TTS)
    models/              # Pydantic models / data classes
    utils/               # Helpers (audio stitching, etc.)
  data/                  # SQLite DB + JSON episode files
  episodes/              # Generated MP3 files
  requirements.txt

frontend/
  src/
    components/          # Reusable UI components
    screens/             # Full-screen views (VibeSetup, Generation, Player)
    hooks/               # Custom React hooks
    lib/                 # Utilities, API client, types
    assets/              # Static assets
  index.html
  package.json
  vite.config.ts
```

## Patterns

- **API calls:** Centralized API client in `frontend/src/lib/api.ts`
- **SSE:** Custom hook `useSSE` for generation progress
- **State:** React Context for global state (current episode, preferences); local state for everything else
- **Backend services:** One service file per pipeline stage (scraper, script_generator, voice_synthesizer, audio_stitcher)
- **Error handling:** Backend returns structured errors; frontend displays human-readable messages

## Comments

- Comment *why*, not *what*
- No comments on self-explanatory code
- TODO comments include a task reference: `# TODO(T12): handle rate limiting`

## Formatting

- **Python:** Black formatter, 88 char line length, isort for imports
- **TypeScript:** Prettier, 100 char line length, single quotes
- **Both:** No trailing whitespace, newline at end of file

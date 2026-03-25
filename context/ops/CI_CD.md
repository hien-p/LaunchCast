# CI/CD Pipeline

> Stub — populate when pipeline is set up.

## Pipeline Overview

- **On push to main:** Deploy frontend to Vercel, deploy backend to Railway/Render
- **Pre-deploy:** Run tests (pytest + vitest)
- Post-hackathon: Add linting, type checking, and test coverage gates

## Deploy Process

- Frontend: Push to main → Vercel auto-deploys
- Backend: Push to main → Railway/Render auto-deploys
- Manual trigger available for both

## Secrets in CI

- API keys stored in hosting platform's environment variable settings
- Never in GitHub Actions secrets (no CI pipeline yet)

# Infrastructure

> Stub — populate when deployment is set up.

## Environments

| Environment | Frontend | Backend | Purpose |
|-------------|----------|---------|---------|
| Local | localhost:5173 | localhost:8000 | Development |
| Production | Vercel | Railway/Render | Public access |

## Hosting

- **Frontend:** Vercel (free tier, auto-deploy from GitHub)
- **Backend:** Railway or Render (free tier, Python support, persistent storage)

## Database Hosting

- SQLite file on backend server filesystem
- Backed up with the deployment (no external DB service)

## Storage

- Episode MP3 files stored on backend filesystem
- Consider object storage (R2, S3) if files grow large post-hackathon

## DNS & Domains

- TBD — custom domain optional for hackathon demo

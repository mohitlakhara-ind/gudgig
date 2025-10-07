## Deployment Guide

### Prerequisites
- Set environment variables securely (do not commit .env)
- Provide strong secrets (32+ chars)
- Configure Sentry DSNs if used

### Docker (recommended)
- Build images:
  - Backend: `docker build -t job-portal-backend ./backend`
  - Frontend: `docker build -t job-portal-frontend .`
- Compose locally: `docker-compose up -d`

### Environment Variables
- Backend: `PORT`, `CLIENT_URL`, `MONGODB_URI`, `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, `RATE_LIMIT_*`, `SENTRY_*`
- Frontend: `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_SENTRY_*`

### Security
- Enforce HTTPS behind a reverse proxy (NGINX/Traefik)
- Set `NODE_ENV=production`
- Configure CORS `CLIENT_URL`

### Observability
- Sentry DSN and sampling
- Scrape `/metrics` for infra monitoring
- Use `/dashboard/health` for quick checks

### Scaling
- Use a managed MongoDB
- Horizontal scale backend and frontend containers

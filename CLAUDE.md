# Project Overview

**Denamu (데나무)** is an RSS-based tech blog curation platform. It aggregates developer blog content from multiple platforms (Tistory, Velog, Medium) into a single service with real-time trending, search, and developer chat features.

- **Production URL**: https://denamu.dev
- **Architecture**: Monorepo with microservices (Docker Compose orchestration)

# Repository Structure

```
server/           # NestJS backend API (Dev port 8080)
client/           # React + Vite frontend (Dev port 5173)
feed-crawler/     # RSS feed crawler with AI tagging
email-worker/     # Email processing via RabbitMQ
docker-compose/   # Infrastructure configs (local, dev, prod)
nginx/            # Reverse proxy configuration
```

# Commands

npm run start:local # Start all services locally (no watch)
npm run start:dev # Start dev environment with hot reload
npm run start:dev:was # Start backend services only
npm run start:dev:feed # Start feed crawler services only
npm run start:dev:email # Start email worker services only
npm run commit # Commitizen for structured commits

# Commit Message

Reference `.cz-config.js`

# Code Review Convention

Uses Pn-level system (Korean language reviews):

- **P1**: Critical - security issues, business logic errors (must fix before deploy)
- **P2**: Important - code quality/functionality issues (must fix)
- **P3**: Medium - potential bug risks, improvements (strongly consider)
- **P4**: Light - readability suggestions (optional)
- **P5**: Questions - optional suggestions

# CI/CD

GitHub Actions workflows deploy to self-hosted runner via GHCR:
`.github/workflows`

- Deploy Application
  - `deploy_server.yml` - NestJS backend
  - `deploy_client.yml` - React frontend
  - `deploy_feed-crawler.yml` - Crawler service
  - `deploy_email-worker.yml` - Email worker
  - `deploy_nginx.yml` - NGINX Conf Apply
- Test workflows run on PR
  - `test_server_dto.yml`
  - `test_server_e2e.yml`
  - `test_feed-crawler.yml`
  - `test_email-worker.yml`

# Docker Compose

All Docker Compose files are located in the `docker-compose/` directory.

Use the appropriate compose file based on the target environment (local, dev, prod).

- `local`: docker-compose.local.yml + docker-compose.infra.yml
- `dev`: docker-compose.dev.yml + docker-compose.infra.yml
- `prod`: docker-compose.prod.yml + docker-compose.prod.infra.yml

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Denamu (데나무)** is an RSS-based tech blog curation platform. It aggregates developer blog content from multiple platforms (Tistory, Velog, Medium) into a single service with real-time trending, search, and developer chat features.

- **Production URL**: https://denamu.dev
- **Architecture**: Monorepo with microservices (Docker Compose orchestration)

## Repository Structure

```
server/           # NestJS backend API (port 8080)
client/           # React + Vite frontend (port 5173)
feed-crawler/     # RSS feed crawler with AI tagging
email-worker/     # Email processing via RabbitMQ
docker-compose/   # Infrastructure configs (local, dev, prod)
nginx/            # Reverse proxy configuration
```

## Common Commands

### Root Level
```bash
npm run start:local      # Start all services locally (no watch)
npm run start:dev        # Start dev environment with hot reload
npm run start:was-dev    # Start backend services only
npm run commit           # Commitizen for structured commits
```

### Server (NestJS)
```bash
cd server
npm run start:dev        # Development with watch mode
npm run build            # Production build
npm run lint             # ESLint
npm run test:unit        # Unit tests
npm run test:e2e         # E2E tests (uses Testcontainers)
npm run test:dto         # DTO validation tests
npm run migration:create # Create DB migrations
```

### Client (React)
```bash
cd client
npm run dev              # Development server
npm run build            # Production build
npm run lint             # ESLint
npm run test             # Vitest unit tests
npm run test:coverage    # Coverage report
```

### Feed Crawler
```bash
cd feed-crawler
npm run start:dev        # Development mode
npm run test:unit        # Unit tests
npm run test:e2e         # Integration tests
```

## Tech Stack

- **Backend**: NestJS, TypeORM, MySQL 8.0, Redis 7.2, RabbitMQ 3.13
- **Frontend**: React 18, TypeScript, Vite, TanStack Query, Zustand, Tailwind CSS, Radix UI
- **Real-time**: Socket.IO (WebSocket chat)
- **AI**: Anthropic Claude SDK (automatic content tagging in feed-crawler)
- **Monitoring**: Prometheus, Grafana, Winston logging
- **Auth**: JWT + OAuth (Google, GitHub) via Passport.js

## Architecture Notes

### Backend (Server)
- Module-based NestJS architecture: each feature has Module, Controller, Service
- TypeORM with MySQL for data persistence
- Redis for caching and session management
- Global exception filters and interceptors for consistent error handling
- Swagger API documentation available

### Frontend (Client)
- TanStack Query for server state, Zustand for client state
- Custom hooks pattern for logic reuse
- Socket.IO client for real-time chat

### Feed Crawler
- tsyringe for dependency injection (not NestJS)
- Scheduled jobs via node-schedule for RSS polling
- Claude AI integration for automatic tag generation
- RabbitMQ for event publishing

### Email Worker
- RabbitMQ consumer for async email processing
- Nodemailer for email delivery

## Code Review Convention

Uses Pn-level system (Korean language reviews):
- **P1**: Critical - security issues, business logic errors (must fix before deploy)
- **P2**: Important - code quality/functionality issues (must fix)
- **P3**: Medium - potential bug risks, improvements (strongly consider)
- **P4**: Light - readability suggestions (optional)
- **P5**: Questions - optional suggestions

## Environment Variables

Key environment variable groups (see `.env.example` files):
- Database: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Redis: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- RabbitMQ: `RABBITMQ_HOST`, `RABBITMQ_PORT`, `RABBITMQ_USER`, `RABBITMQ_PASSWORD`
- JWT: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- OAuth: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

## CI/CD

GitHub Actions workflows deploy to self-hosted runner via GHCR:
- `deploy_server.yml` - NestJS backend
- `deploy_client.yml` - React frontend
- `deploy_feed-crawler.yml` - Crawler service
- `deploy_email-worker.yml` - Email worker
- Test workflows run on PR: `test_server_dto.yml`, `test_server_e2e.yml`, `test_feed-crawler.yml`

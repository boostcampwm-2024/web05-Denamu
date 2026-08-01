# System Purpose

This system is an API provider server that exposes the service’s complete set of APIs, including post-related APIs, admin APIs, chat APIs, and activity-related APIs.
It provides APIs over HTTP, WebSocket (via Socket.IO), and Server-Sent Events (SSE).

# Stack

[Server]

- Node.js 22
- NestJS 10
- TypeORM
- Winston Logger
- Passport
- Bcrypt

[Infra]

- Docker
- AWS EC2
- Redis
- RabbitMQ
- MySQL
- Prometheus

[Test]

- Jest

# Data Flow

See `/ARCHITECTURE.md` for complete system communication topology.

This service communicates with:

- feed-crawler via Redis queues (feed:full-crawl:queue, feed:ai:queue)
- email-worker via RabbitMQ (EmailExchange)
- client via HTTP/WebSocket/SSE

# Database Schema Changes

When modifying a database entity, you MUST update all three of the following in the same change to keep the runtime schema and the fresh-DB bootstrap snapshot in sync:

1. `*.entity.ts` — the TypeORM entity definition (`server/src/**/entity/`)
2. `init.sql` — the fresh-DB bootstrap snapshot (`docker-compose/db/init.sql`)
3. migration — a new TypeORM migration with `up`/`down` (`server/src/common/database/migration/`)

Column definitions (type, nullability, default) MUST be identical across all three. Omitting any one causes schema drift between freshly bootstrapped and migrated databases.

# Commands

npm run \*
build - Production build
start - Production start
start:dev - Development Start

# System Purpose

This system is an API provider server that exposes the service’s complete set of APIs, including post-related APIs, admin APIs, chat APIs, and activity-related APIs.
It provides APIs over HTTP, WebSocket (via Socket.IO), and Server-Sent Events (SSE).

# Stack

[Server]

- Node.js 22
- NestJS 10
- TypeORM
- Winston
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

# Reference Docs

| File                          | Authority      |
| ----------------------------- | -------------- |
| agent_docs/api_design.md      | API contracts  |
| agent_docs/database_schema.md | DB modeling    |
| agent_docs/test_design.md     | Test contracts |

# Commands

npm run \*
build - Production build
start - Production start
start:dev - Development Start

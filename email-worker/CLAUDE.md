# System Purpose

The Email Worker exists to offload SMTP delivery from the API path and eliminate latency caused by synchronous email transmission.

Email sending MUST be processed asynchronously to:

- protect API response times
- isolate failures
- improve observability
- reduce operational coupling with the application server

Embedding SMTP logic inside the server is forbidden due to poor failure visibility and debugging complexity.

# Architectural Role

The Email Worker is a **message-driven infrastructure component** responsible for reliable email dispatch.

Design goals:

- failure containment
- retry-safe processing
- deterministic logging
- operational clarity

The API MUST never send emails directly.

# Processing Workflow

1. Listen to RabbitMQ queues continuously.
2. Upon message receipt, validate payload integrity.
3. Attempt email delivery via the configured SMTP relay.
4. If delivery fails:
   - emit structured error logs (Winston)
   - route the message to a RabbitMQ Dead Letter Queue (DLQ)

# Environment & Stack

Stack: Node.js 22, RabbitMQ, Winston.
Infra: Docker, AWS EC2.

# Reference Docs

| File                               | Authority        |
| ---------------------------------- | ---------------- |
| agent_docs/service_architecture.md | Service patterns |
| agent_docs/test_design.md          | Test contracts   |

# Commands

npm run build - Production build
npm run start - Production start
npm run start:dev - Development start

# System Purpose

The Email Worker exists to offload SMTP delivery from the API path and eliminate latency caused by synchronous email transmission.

Email sending MUST be processed asynchronously to:

- protect API response times
- isolate failures
- improve observability
- reduce operational coupling with the application server

Embedding SMTP logic inside the server is forbidden due to poor failure visibility and debugging complexity.

# Data Flow

See `/ARCHITECTURE.md` for complete system communication topology.

Consumes RabbitMQ messages from server:

- Exchange: EmailExchange (topic exchange)
- Routing Key: email.send
- DLQ: DeadLetterExchange (3 retries with exponential backoff)

Triggers: signup verification, RSS accept/reject, password reset, account deletion, RSS removal

# Processing Workflow

1. Listen to RabbitMQ queues continuously.
2. Upon message receipt, validate payload integrity.
3. Attempt email delivery via the configured SMTP relay.
4. If delivery fails:
   - emit structured error logs (Winston)
   - route the message to a RabbitMQ Dead Letter Queue (DLQ)

# Stack

[Core]

- Node.js 22
- tsyringe
- Winston.

[Infra]

- Docker
- AWS EC2
- RabbitMQ

[Test]

- Jest

# Reference Docs

| File                               | Authority        |
| ---------------------------------- | ---------------- |
| agent_docs/service_architecture.md | Service patterns |
| agent_docs/test_design.md          | Test contracts   |

# Commands

npm run \*
build - Production build
start - Production start
start:dev - Development start

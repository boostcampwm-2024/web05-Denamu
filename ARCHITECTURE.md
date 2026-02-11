# System Architecture

## Communication Topology

### Data Flow Between Services

```
client (React/Vite)
  → nginx (reverse proxy, static files)
    → server (NestJS)
        ├── MySQL 8.0 (TypeORM, Full-Text Search)
        ├── Redis 6 (cache, session, trends)
        │
        ├──[Redis rpush]──→ feed-crawler (standalone Node.js, cron scheduler)
        │   queue: feed:full-crawl:queue (triggered on RSS approval, full crawl)
        │   queue: feed:ai:queue (AI tag/summary for crawled feeds)
        │   consumer pattern: Redis rpop polling (RabbitMQ migration planned)
        │   feed-crawler → MySQL (feed persistence), Redis (recent feed cache)
        │
        └──[RabbitMQ AMQP]──→ email-worker (standalone Node.js)
            exchange: EmailExchange, routing: email.send
            DLQ: DeadLetterExchange (3 retries with exponential backoff, then dead letter)
            triggers: signup verification, RSS accept/reject, password reset, account deletion, RSS removal

client ←──[SSE]── server (real-time trending updates)
```

## Queue Specifications

### Redis Queues (server → feed-crawler)

- feed:full-crawl:queue: RSS feed crawling requests
  - Trigger: Admin RSS approval
  - Purpose: Full crawl of newly approved RSS sources
- feed:ai:queue: AI tagging and summarization jobs
  - Trigger: New posts detected during crawl
  - Purpose: Generate summaries and tags via Anthropic Claude
- Consumer Pattern: Redis rpop polling (blocking read with timeout)
- Migration Plan: RabbitMQ migration planned for improved reliability

### RabbitMQ (server → email-worker)

- Exchange: EmailExchange (topic exchange)
- Routing Key: email.send
- Retry Policy: 3 attempts with exponential backoff
- DLQ: DeadLetterExchange for failed deliveries after retry exhaustion
- Triggers:
  - Signup verification email
  - RSS accept/reject notification
  - Password reset email
  - Account deletion confirmation
  - RSS removal notification

## Service Communication Patterns

### Server → Feed Crawler (Redis)

- Pattern: Fire-and-forget queue push
- Reliability: At-least-once delivery (manual retry on consumer)
- Ordering: FIFO within each queue
- Backpressure: Queue length monitoring via Redis metrics

### Server → Email Worker (RabbitMQ)

- Pattern: Reliable async messaging with DLQ
- Reliability: At-least-once delivery (automatic retry with exponential backoff)
- Ordering: Not guaranteed (parallel consumers)
- Failure Handling: 3 retries → DLQ → manual intervention

### Server → Client (SSE)

- Pattern: Server-push for real-time updates
- Use Case: Trending posts updates
- Reconnection: Client-side automatic retry with exponential backoff
- Heartbeat: Periodic keep-alive to detect stale connections

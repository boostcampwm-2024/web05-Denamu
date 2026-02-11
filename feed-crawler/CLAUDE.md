# System Purpose

The application ingests RSS feeds, extracts newly published blog posts, enriches them with AI-generated metadata, and persists the results for downstream consumption.
The system MUST prioritize correctness, determinism, and operational safety.

# Data Flow

See `/ARCHITECTURE.md` for complete system communication topology.

Consumes Redis queues from server:

- feed:full-crawl:queue: RSS crawling requests (triggered by admin RSS approval)
- feed:ai:queue: AI tagging/summary jobs for newly crawled posts

Consumer pattern: Redis rpop polling (blocking read with timeout)

# Processing Workflow

1. Every 30 minutes, read RSS source metadata from the database.
2. Fetch RSS feeds and extract posts published within the last 30 minutes.
3. Persist new posts to the database.
4. Enqueue new posts into the Redis AI Queue.
5. At scheduled intervals, consume queue items and request content summarization and tag generation from Anthropic Claude.
6. Allow up to 3 retry attempts per item.
7. If parsing fails:
   - decrement the retry count
   - requeue the item at the front for priority processing
8. If parsing succeeds:
   - persist summaries and tags to the database.

# Stack

[Core]

- Node.js 22
- tsyringe
- Winston

[Infra]

- Docker
- MySQL
- Redis
- AWS EC2

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

# System Purpose

The application ingests RSS feeds, extracts newly published blog posts, enriches them with AI-generated metadata, and persists the results for downstream consumption.
The system MUST prioritize correctness, determinism, and operational safety.

# Processing Workflow

1. Every 30 minutes, read RSS source metadata from the database.
2. Fetch RSS feeds and extract posts published within the last 30 minutes.
3. Persist new posts to the database.
4. Enqueue new posts into the Redis **AI Queue**.
5. At scheduled intervals, consume queue items and request content summarization and tag generation from **Anthropic Claude**.
6. Allow up to **3 retry attempts** per item.
7. If parsing fails:
   - decrement the retry count
   - requeue the item at the **front** for priority processing
8. If parsing succeeds:
   - persist summaries and tags to the database.

# Reliability Requirements

- Failures MUST be observable via structured logging (Winston).
- Database writes MUST be atomic where consistency is required.

# Environment & Stack

Stack: Node.js 22, MySQL, Redis, Winston.
Infra: Docker, AWS EC2.

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

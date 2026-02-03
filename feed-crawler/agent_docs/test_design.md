# Unit Tests

## Structure Rules

- Jest-based. Uses **Given-When-Then** pattern.
- `Repository` and `Parser` are mocked with `jest.fn()`.
- Private methods are tested using `jest.spyOn()`.
- `@anthropic-ai/sdk` is module-mocked with `jest.mock()`.

## Test Targets

- **FeedCrawler**: Crawling flow, parallel processing, early termination scenarios
- **ClaudeEventWorker**: AI requests, retry branching, rate-limit handling, store `NULL` on failure
- **FeedParserManager**: Format detection and parser selection
- **Parser (Rss20/Atom10)**: XML extraction, time filtering
- **AbstractQueueWorker**: Base queue worker behavior

# E2E Tests

## Setup

- `testContext.setup.ts` creates actual MySQL and Redis containers.
- Containers are created **for test purposes only**.

## Test Execution Rules

- **Invalid RSS URL**: Verify logging and safe shutdown on parsing failure.
- **Normal Crawling Flow**: Validate that feeds are correctly stored in DB, Redis cache, and AI queue.
- **AI Processing Flow**: Validate the full cycle — queue consumption → API call → result storage.

## Tear Down

- **All temporary test containers must be destroyed.**
- No test infrastructure artifacts may persist after completion.

# Non-Negotiable Principles

- Tests **must be deterministic**.
- Tests **must be isolated**.
- Tests **must be parallel-safe**.

# Commands

| Command                 | Description                    |
| ----------------------- | ------------------------------ |
| `npm run test:unit`     | Unit tests                     |
| `npm run test:unit:cov` | Unit tests with coverage       |
| `npm run test:e2e`      | End-to-end tests               |
| `npm run test:e2e:cov`  | End-to-end tests with coverage |

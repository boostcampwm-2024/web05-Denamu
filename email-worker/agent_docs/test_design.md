# Principles

Tests MUST be deterministic.
Tests MUST be isolated.
Tests MUST be parallel-safe.
GIVEN / WHEN / THEN comments MUST be used inside each it block only.

# Test Utilities

- `rabbitmq-test.helper.ts` provides:
  - `getMessagesFromQueue`: Peek messages without consuming
  - `getQueueMessageCount`: Count messages in a queue
  - `publishEmailMessage`: Publish test messages
  - `waitForQueueMessage`: Poll for message arrival
  - `purgeAllEmailQueues`: Clear all email queues
  - `clearMailpit` / `getMailpitMessages`: Retrieve and clear Mailpit emails

# Unit Tests

## Mocking Rule

`node mailer` and `RabbitMQManager` are mocked with `jest.fn()`

# E2E Tests

## Setup

RabbitMQ: Use `rabbitmq:4.1-management` image. Queues/exchanges auto-created via `definitions.json`.
Mailpit: Use `axllent/mailpit` image. SMTP port `1025`, API port `8025`.
Containers are created for test purposes only.

## Test Execution Rules

Normal Flow: Validate successful send for each email type; verify reception via Mailpit API.
Transient Error: Validate routing to Wait Queues (5s/10s/20s) based on `retryCount`.
Permanent Error: Verify immediate DLQ routing on SMTP 5xx errors.
Max Retry: Validate DLQ routing when `retryCount >= 3`.
DLQ Headers: Validate completeness of debugging headers in failed messages.

## Tear Down

ALL temporary test containers MUST be destroyed.
No test infrastructure artifacts may persist after test completion.

# Commands

npm run \*
test:unit - Unit tests
test:unit:cov - Unit tests with coverage
test:e2e - End-to-end tests
test:e2e:cov - End-to-end tests with coverage

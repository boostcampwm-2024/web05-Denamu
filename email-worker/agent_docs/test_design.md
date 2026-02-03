# Unit Tests

## Structure Rules

- Tests are **mock-based** and follow the **Arrange-Act-Assert** pattern.
- `EmailConsumer`, `EmailService`, and `RabbitMQService` are tested **independently**.

## Test Targets

- **EmailConsumer**: Verify `handleEmailByType` (dispatch by type) and `handleEmailByError` (routing by error).
- **EmailService**: Verify SMTP send success/failure.
- **RabbitMQService**: Verify message publish and consume operations.

# E2E Tests

## Setup

- **RabbitMQ**: Use `rabbitmq:4.1-management` image. Queues/exchanges auto-created via `definitions.json`.
- **Mailpit**: Use `axllent/mailpit` image. SMTP port `1025`, API port `8025`.
- Containers are created **for test purposes only**.

## Test Execution Rules

- **Normal Flow**: Validate successful send for each email type; verify reception via Mailpit API.
- **Transient Error**: Validate routing to Wait Queues (5s/10s/20s) based on `retryCount`.
- **Permanent Error**: Verify immediate DLQ routing on SMTP 5xx errors.
- **Max Retry**: Validate DLQ routing when `retryCount >= 3`.
- **DLQ Headers**: Validate completeness of debugging headers in failed messages.

## Test Utilities

- **`rabbitmq-test.helper.ts`** provides:
  - `getMessagesFromQueue`: Peek messages without consuming
  - `getQueueMessageCount`: Count messages in a queue
  - `publishEmailMessage`: Publish test messages
  - `waitForQueueMessage`: Poll for message arrival
  - `purgeAllEmailQueues`: Clear all email queues
  - `clearMailpit` / `getMailpitMessages`: Retrieve and clear Mailpit emails

## Tear Down

- **All temporary test containers must be destroyed.**
- No test infrastructure artifacts may persist after completion.

# Non-Negotiable Principles

- Tests **must be deterministic**.
- Tests **must be isolated**.

# Commands

npm run test:unit # Unit tests
npm run test:unit:cov # Unit tests with coverage
npm run test:e2e # End-to-end tests
npm run test:e2e:cov # End-to-end tests with coverage

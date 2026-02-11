# Principles

Tests MUST be deterministic.
Tests MUST be isolated.
Tests MUST be parallel-safe.
GIVEN / WHEN / THEN comments MUST be used inside each it block only.

# Unit Tests

## Mocking Rule

`Repository` and `Parser` are mocked with `jest.fn()`.
Private methods are tested using `jest.spyOn()`.
`@anthropic-ai/sdk` is module-mocked with `jest.mock()`.

# E2E Tests

## Setup

`testContext.setup.ts` creates actual MySQL and Redis containers.
Containers are created for test purposes only.

## Test Execution Rules

Invalid RSS URL: Verify logging and safe shutdown on parsing failure.
Normal Crawling Flow: Validate that feeds are correctly stored in DB, Redis cache, and AI queue.
AI Processing Flow: Validate the full cycle — queue consumption → API call → result storage.

## Tear Down

ALL temporary test containers MUST be destroyed.
No test infrastructure artifacts may persist after test completion.

# Commands

npm run \*
test:unit - Unit tests
test:unit:cov - Unit tests with coverage
test:e2e - End-to-end tests
test:e2e:cov - End-to-end tests with coverage

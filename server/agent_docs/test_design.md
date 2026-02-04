# DTO Validation Tests

Test Structure Rules
A DTO instance MUST be created in beforeEach.
In the given phase of each test, inject invalid data explicitly.
The success case MUST be executed first.
Failure cases MUST be grouped under a separate describe block.

## Naming Convention

The top-level describe block MUST follow this naming format: `${DTO-CLASS.name} Test`
Test case names MUST follow this format: `~가 ~일 경우 유효성 검사에 {실패/성공}한다.`

## Principle

DTO tests exist to validate input contracts, not business logic.
Each test MUST assert exactly one validation outcome.
GIVEN / WHEN / THEN comments MUST be used inside each it block only.

# E2E Tests

## Setup

Create temporary containers dedicated to testing.
Spawn test workers explicitly.

## Environment Setup (After Env)

One worker MUST map to exactly one database.
Each worker MUST use an isolated database.
After each test execution, ALL database data MUST be fully cleared.
Cross-test data sharing is strictly forbidden.

## Test Execution Rules

Precondition data MUST be inserted using: test/config/common/fixture
API URLs MUST be declared as constants.
The top-level describe block MUST follow this naming format: `{METHOD} {URL} E2E Test`
Each test case name MUST follow this format: `[{HTTP_STATUS}] {action} 할 경우 {when}을 {실패/성공}한다.`

## Tear Down

ALL temporary test containers MUST be destroyed.
No test infrastructure artifacts may persist after test completion.

# Principles

Tests MUST be deterministic.
Tests MUST be isolated.
Tests MUST be parallel-safe.
GIVEN / WHEN / THEN comments MUST be used inside each it block only.

# Commands

npm run \*
test:unit - Unit Test
test:unit:cov - Unit Test With Coverage
test:e2e - E2E Test
test:e2e:cov - E2E Test With Coverage
test:dto - DTO Test
test:dto:cov - DTO Test With Coverage
test - Unit + E2E + DTO Test
test:cov - Unit + E2E + DTO Test With Coverage

# Sample

test/sample/dto/sample.dto.spec.ts
test/sample/e2e/sample.e2e-spec.ts

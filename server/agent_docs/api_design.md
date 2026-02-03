All external APIs MUST follow RESTful principles.
Prioritize predictability and consistency over theoretical REST purity.
Consistency is more valuable than ideological correctness.

# Directory Roles

**Core Structure**
api-docs/ → OpenAPI (Swagger) specifications. Single source of truth.
controller/ → Transport boundary only. Must not contain business logic.
dto/ → Typed request/response schemas. Validation is mandatory.
service/ → Business orchestration layer.
repository/ → Persistence boundary. Encapsulates database access.
entity/ → ORM mappings. Must never be exposed externally.
module/ → Dependency graph root for DI.
constant/ → Domain constants only. No executable behavior.

# Design Philosophy

Optimize for: long-term evolvability, operational simplicity, failure tolerance
All request bodies MUST be received through DTO classes.
All external APIs MUST be documented using Swagger (OpenAPI).

# Forbidden Practices

Embedding business logic inside controllers
Returning ORM entities directly Coupling
API contracts to database schema

# Layering Pattern

Controller -> Service -> Repository

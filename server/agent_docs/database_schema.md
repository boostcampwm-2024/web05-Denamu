# Migration Enforcement

All database schema changes MUST be executed through TypeORM Migrations.
Manual schema modifications are strictly forbidden.

## Forbidden:

Running ALTER TABLE directly in production
Modifying schemas via GUI tools (e.g., MySQL Workbench)
Auto-sync features such as synchronize: true
Hotfix schema changes without a migration record

## Rationale

The database is the highest-risk persistence layer.
Untracked schema changes destroy:
reproducibility
rollback capability
deployment safety
auditability
If a schema cannot be recreated from migration history, the system is operationally unsafe.

# Migration Requirements

Every migration MUST be:
Deterministic — produces identical schemas across environments
Reversible — includes a safe rollback (down)
Backward-compatible whenever possible
Reviewed before deployment

# Commands

npm run \*
npm run typeorm
npm run migration:create
npm run prod:migration:generate

Update all `CLAUDE.md` files across the monorepo to reflect the current state of the codebase.

> Targets: `/CLAUDE.md`, `server/CLAUDE.md`, `client/CLAUDE.md`, `feed-crawler/CLAUDE.md`, `email-worker/CLAUDE.md`

---

## Step 1: Scan each service

Run these commands in parallel:

```bash
cat package.json
ls docker-compose/
cat ARCHITECTURE.md

cat server/package.json
find server/src -type d | sort

cat client/package.json
find client/src -type d | sort
cat client/vite.config.ts

cat feed-crawler/package.json
find feed-crawler/src -type d | sort

cat email-worker/package.json
find email-worker/src -type d | sort
```

## Step 2: Identify what has changed

Compare scan results against each CLAUDE.md and identify changes per file:

| CLAUDE.md                | Watch for changes in                                                   |
| ------------------------ | ---------------------------------------------------------------------- |
| `/CLAUDE.md`             | Monorepo structure, docker-compose files, CI/CD workflows, npm scripts |
| `server/CLAUDE.md`       | NestJS modules, new packages in package.json, data flow, API protocols |
| `client/CLAUDE.md`       | React components, routes, stores, new packages, vite.config.ts         |
| `feed-crawler/CLAUDE.md` | Processing workflow, Redis queue names, new packages                   |
| `email-worker/CLAUDE.md` | RabbitMQ routing keys, DLQ config, trigger events, new packages        |

Do NOT change sections that have not actually changed.

## Step 3: Update each CLAUDE.md

Apply only the changes identified in Step 2. Follow the rules below for each file.

---

### `/CLAUDE.md` (Root)

- Update the `Repository Structure` section if directories are added/removed
- Update `Commands` if npm scripts in the root `package.json` have changed
- Do NOT touch Identity, Philosophy, Absolute Decision Hierarchy, Engineering Laws — these are permanent policy, not derived from code

---

### `server/CLAUDE.md`

- **Stack**: Update only if packages in `server/package.json` materially changed (new runtime dep or removed dep). Format: `- LibraryName vX.Y — one-line description`
- **Data Flow**: Update queue names or protocols only if they changed in source code
- **Reference Docs**: Update only if agent_docs files were added or removed
- **Commands**: Keep in sync with `server/package.json` scripts

---

### `client/CLAUDE.md`

- **Stack**: Update if new libraries added or removed from `client/package.json`
- **Directory Structure**: Regenerate only if `src/` directory layout changed. Format: `| src/dir/ | Role |`. Include only directories with meaningful roles.
- **Routing**: Update if new pages or routing patterns were introduced
- **State Management**: Add/remove Zustand stores or React Query patterns if changed
- **Build Configuration**: Update only if `vite.config.ts` chunks or dev server config changed
- **Commands**: Keep in sync with `client/package.json` scripts

---

### `feed-crawler/CLAUDE.md`

- **Processing Workflow**: Update if the crawl schedule, queue names, retry logic, or AI provider changed
- **Stack**: Update if packages in `feed-crawler/package.json` changed
- **Data Flow**: Update Redis queue names if changed in source code
- **Reference Docs**: Update only if agent_docs files were added or removed
- **Commands**: Keep in sync with `feed-crawler/package.json` scripts

---

### `email-worker/CLAUDE.md`

- **Processing Workflow**: Update if delivery logic, retry strategy, or DLQ config changed
- **Data Flow**: Update if RabbitMQ exchange name, routing key, or trigger events changed
- **Stack**: Update if packages in `email-worker/package.json` changed
- **Reference Docs**: Update only if agent_docs files were added or removed
- **Commands**: Keep in sync with `email-worker/package.json` scripts

---

## General Rules

- List only libraries the project actually uses at runtime or build time — no ESLint/Prettier plugins individually
- Do not rewrite prose that is still accurate
- Do not add sections that don't already exist in the target CLAUDE.md
- Cross-service data flow (queue names, exchange names) must stay consistent across all affected CLAUDE.md files

## Step 4: Confirm

After all edits, briefly summarize in Korean:

- Which CLAUDE.md files were updated and what changed
- Which were left unchanged and why

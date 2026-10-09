<!-- pm-qa-plugin:start — managed block, edit freely -->
## PM/QA Plugin

@project.yaml

> Path defaults (if `project.yaml` has no `paths:` section): `context_dir` → `business-context/`, `requirements_dir` → `requirements/`, `testing_dir` → `testing/`

## Project Context Rule (REQUIRED)

Each skill specifies which context files it loads. All context files live in `business-context/`.

If context files are missing, suggest running `/generate-project-context` first.
<!-- pm-qa-plugin:end -->

# Project: Xiangqi Arena

This file is auto-loaded at the start of every Claude Code session.

## Golden Rules
1. The server is authoritative for moves, clocks and ratings. Never trust client-computed results.
2. Shared types, enums, WS events and game constants live in `@xiangqi/shared-types`. Do not redefine them in an app.
3. Never commit secrets or `.env`. Never put tokens in URLs. WS auth uses `AUTH_CONNECT`.
4. Run `pnpm typecheck && pnpm lint && pnpm test` and show the exit codes before saying work is done.

## Imported Rules
@.claude/rules/git-workflow.md
@.claude/rules/web-security.md
@.claude/rules/typescript-standards.md
@.claude/rules/definition-of-done.md

## Commands
- `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test`
- `pnpm db:up` / `pnpm db:down` for Postgres and Redis
- `pnpm --filter @xiangqi/server prisma:generate` after schema changes

## Workflow
- Use `/code-review` before committing
- Create feature branches: `feat/<issue>-<slug>`
- Write conventional commits

## Out-of-scope for Claude
- Editing `.env` or any secrets
- Force pushing, publishing packages, resetting the database
- Changing Pikafish licensing files (GPL v3) without asking

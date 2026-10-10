# Xiangqi Arena

Real-time online Xiangqi (Chinese chess) platform. Turborepo + pnpm workspaces.

## Requirements

- Node.js 20 or newer
- pnpm 9 or newer (`corepack enable`)
- Docker (for Postgres and Redis)

## Getting started

```bash
pnpm install
cp .env.example .env
pnpm db:up
pnpm --filter @xiangqi/server prisma:generate
pnpm db:deploy
pnpm dev
```

- Web: http://localhost:3000
- Server: http://localhost:4000 (health check: `/health`)

Never commit `.env`. Put real secrets only in your local `.env`.

## Scripts

Run these from the repository root. They run in every workspace through Turborepo.

| Command              | What it does                                       |
| -------------------- | -------------------------------------------------- |
| `pnpm dev`           | Run all apps in dev mode                           |
| `pnpm build`         | Build all packages and apps                        |
| `pnpm lint`          | Lint all workspaces                                |
| `pnpm typecheck`     | Type check all workspaces                          |
| `pnpm test`          | Run all tests                                      |
| `pnpm test:coverage` | Run all tests and write coverage                   |
| `pnpm format`        | Format all files with Prettier                     |
| `pnpm format:check`  | Check formatting without changing files            |
| `pnpm db:up`         | Start Postgres and Redis with Docker               |
| `pnpm db:down`       | Stop Postgres and Redis                            |
| `pnpm db:migrate`    | Create and apply a Prisma migration (needs `.env`) |
| `pnpm db:deploy`     | Apply existing Prisma migrations (needs `.env`)    |

Run one package only:

```bash
pnpm --filter @xiangqi/server test
pnpm --filter @xiangqi/web lint
```

## Structure

```
apps/
  web/                 Next.js 14 (App Router), Tailwind, Zustand, Socket.io client
  server/              NestJS, Socket.io gateway (Redis adapter), Prisma, BullMQ
packages/
  shared-types/        Enums, WS event types, FEN utils, WXF and Elo helpers
  xiangqi-engine/      Pure rules engine (Node only, no browser, network or database)
  pikafish-wasm/       Web Worker wrapper for Pikafish (Wasm, GPL v3)
  config-typescript/   Shared tsconfig bases
  config-eslint/       Shared ESLint configs
  config-vitest/       Shared Vitest coverage preset and repository checks
.github/               CI workflow and pull request template
.claude/               Rules, commands and hooks for Claude Code
```

## Branch and commit naming

Every branch and commit names its ticket id (the story id), for example `ENG-F02-S03`.

| Item   | Rule                                                      | Example                                                         |
| ------ | --------------------------------------------------------- | --------------------------------------------------------------- |
| Branch | `<type>/<story-id>-<slug>` (story id in lowercase)        | `feat/eng-f02-s03-move-validation`                              |
| Commit | `<type>(<scope>): <subject>` and footer `Refs <STORY-ID>` | `feat(game): validate moves on the server` + `Refs ENG-F02-S03` |
| PR     | Title in the commit format, body has `Closes #<issue>`    | `feat(game): validate moves on the server`                      |

- Types: `feat`, `fix`, `hotfix`, `refactor`, `perf`, `test`, `docs`, `chore`, `security`.
- Find the story id in the ticket title, for example `INF-F01-S06: Repository Guide and PR Template`.
- A branch with an issue number (`fix/42-auth-timeout`) or no id (`chore/update-deps`) is still accepted.
- Full rules: `.claude/rules/git-workflow.md`.

## Pull requests

- Use the template in `.github/PULL_REQUEST_TEMPLATE.md`. It asks for the linked ticket, the change and the test result.
- CI (`.github/workflows/ci.yml`) runs format check, lint, typecheck and tests with coverage on every pull request.
- Never force push to `main`, `master` or `develop`.

## Definition of Done

A story ticket is done when all of these are true:

- [ ] Acceptance criteria reviewed and agreed upon
- [ ] Code reviewed and approved
- [ ] Unit and integration tests written and passing
- [ ] All test scenarios pass
- [ ] All files changed during development verified, with no unintended side effects (run impacted test scenarios)

Before you ask for review, `pnpm typecheck`, `pnpm lint`, `pnpm test` and `pnpm build` must exit 0.
Details and the browser checks are in `.claude/rules/definition-of-done.md`.

## Key rules (implemented in later stories)

- Auth: OAuth 2.0 PKCE and email OTP. The WS access token is sent in the first message (`AUTH_CONNECT`). The `Origin` header is validated.
- Clock: server-authoritative. It starts after `CLIENT_READY`.
- Disconnect: 45 s window, 90 s budget per game.
- Rating: Blitz (3+2), Rapid (10+0), Classic (15+10). Base 1500, floor 100. K = 40 for the first 10 games, then 20 (below 2400) or 10.
- AI: 100% client-side Wasm. Guests allowed.

## Licence note

`packages/pikafish-wasm` ships Pikafish, which is GPL v3. See its README.

## Git worktrees

This project uses git worktrees for parallel development.

```bash
make setup                     # one-time setup (git hooks, pnpm install)
make worktree-new feat/eng-f02-s03-move-validation
make worktree-switch feat/eng-f02-s03-move-validation
make worktree-list
make worktree-rm feat/eng-f02-s03-move-validation
```

Worktrees live in `../worktrees/` next to the repository. Run `pnpm install` inside each new worktree.

## Claude Code harness

- Rules: `.claude/rules/` (git workflow, security, TypeScript standards, definition of done)
- Git hooks: `.githooks/` (`post-checkout` checks the branch name, `pre-push` runs typecheck, lint and test)
- Claude hooks: `.claude/hooks/` (format and typecheck after edits, secret scan before commits)
- Permissions: `.claude/settings.json`

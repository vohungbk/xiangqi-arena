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
pnpm dev
```

- Web: http://localhost:3000
- Server: http://localhost:4000 (health check: `/health`)

## Scripts

| Command          | What it does                         |
| ---------------- | ------------------------------------ |
| `pnpm dev`       | Run all apps in dev mode             |
| `pnpm build`     | Build all packages and apps          |
| `pnpm lint`      | Lint all workspaces                  |
| `pnpm typecheck` | Type check all workspaces            |
| `pnpm test`      | Run all tests                        |
| `pnpm db:up`     | Start Postgres and Redis with Docker |
| `pnpm db:down`   | Stop Postgres and Redis              |

## Structure

```
apps/
  web/                 Next.js 14 (App Router), Tailwind, Zustand, Socket.io client
  server/              NestJS, Socket.io gateway (Redis adapter), Prisma, BullMQ
packages/
  shared-types/        Enums, WS event types, FEN utils, WXF and Elo helpers
  pikafish-wasm/       Web Worker wrapper for Pikafish (Wasm, GPL v3)
  config-typescript/   Shared tsconfig bases
  config-eslint/       Shared ESLint configs
```

## Key rules (implemented in later stories)

- Auth: OAuth 2.0 PKCE and email OTP. The WS access token is sent in the first message (`AUTH_CONNECT`). The `Origin` header is validated.
- Clock: server-authoritative. It starts after `CLIENT_READY`.
- Disconnect: 45 s window, 90 s budget per game.
- Rating: Blitz (3+2), Rapid (10+0), Classic (15+10). Base 1500, floor 100. K = 40 for the first 10 games, then 20 (below 2400) or 10.
- AI: 100% client-side Wasm. Guests allowed.

## Licence note

`packages/pikafish-wasm` ships Pikafish, which is GPL v3. See its README.

## Git Worktrees

This project uses git worktrees for parallel development.

```bash
make setup                     # one-time setup (git hooks, pnpm install)
make worktree-new feat/42-add-search
make worktree-switch feat/42-add-search
make worktree-list
make worktree-rm feat/42-add-search
```

Worktrees live in `.worktrees/`. Run `pnpm install` inside each new worktree.

## Claude Code Harness

- Rules: `.claude/rules/` (git workflow, security, TypeScript standards, definition of done)
- Git hooks: `.githooks/` (`post-checkout`, `pre-push` runs typecheck, lint and test)
- Claude hooks: `.claude/hooks/` (format and typecheck after edits, secret scan before commits)
- Permissions: `.claude/settings.json`
- PR template: `.github/PULL_REQUEST_TEMPLATE.md`

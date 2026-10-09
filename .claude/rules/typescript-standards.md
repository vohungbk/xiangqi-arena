# Coding Standards

TypeScript monorepo: Next.js 14 (App Router) in `apps/web`, NestJS in `apps/server`, shared code in `packages/*`.

## General Principles

1. **Clarity over cleverness** — Write code that is easy to read and understand
2. **Consistency** — Follow existing patterns in the codebase
3. **Simple first** — Avoid premature abstraction and optimization
4. **Test coverage** — New code should have corresponding tests

## Language & Style

- `strict` TypeScript. No `any`; use `unknown` and narrow.
- Use `import type` for type-only imports (exception: Nest DI classes that need runtime metadata).
- Prefer `const`, early returns and small functions.
- Prettier formats the code (`.prettierrc`: single quotes, trailing commas, width 100).
- Shared types, enums, WS events and game constants live in `@xiangqi/shared-types`. Never redefine them in an app.

## Code Organization

- `apps/web`: pages in `src/app`, state in `src/store` (Zustand), helpers in `src/lib`. Components are server components by default; add `'use client'` only when needed.
- `apps/server`: one Nest module per domain (`game`, `auth`, `rating`, `matchmaking`). Gateways handle transport only; put logic in services.
- `packages/pikafish-wasm`: engine runs in a Web Worker, never on the main thread.
- Pure logic (Elo, FEN, rules) goes in `shared-types` or a service so it can be unit tested without a server.
- Apps depend on packages through `workspace:*`. No cross-imports between `apps/web` and `apps/server`.

## Error Handling

- Server: throw Nest `HttpException` subclasses for REST. For WS, emit typed events (`INVALID_MOVE`, `AUTH_ERROR`, `ROOM_ERROR`) instead of throwing.
- Never swallow errors with an empty `catch`. Log with context (no secrets) or handle.
- Client: show a user-friendly message. Never show stack traces or raw server errors.

## Naming Conventions

- Files: `kebab-case.ts`; React components `PascalCase.tsx`; tests `*.test.ts`.
- Types and classes `PascalCase`, variables and functions `camelCase`, constants `UPPER_SNAKE_CASE`.
- Enum members `UPPER_SNAKE_CASE`. WS event names match the `WSEvents` enum.

## Performance

- Keep the WS payload small. Send FEN and the last move, not the full history, when possible.
- Memoize expensive renders (board). Avoid re-rendering the whole board on clock ticks.
- Use Redis for room and queue state shared across server instances. Do not keep game state only in process memory.
- Run heavy work (Wasm engine) off the main thread.

## Linting & Formatting

Run before every commit:

```bash
pnpm lint && pnpm typecheck
pnpm format   # prettier
```

ESLint config lives in `packages/config-eslint`. Do not disable rules inline without a reason in a comment.

## Anti-patterns to Avoid

- `any`, `@ts-ignore` without an explanation
- Business logic inside controllers, gateways or React components
- Trusting client data for moves, time or ratings
- Magic numbers for K-factors, timeouts or windows (use the constants from `@xiangqi/shared-types`)
- Duplicating types between web and server
- Committing `.env`, build output (`dist`, `.next`) or `node_modules`

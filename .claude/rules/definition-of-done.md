---
description: Use when declaring work finished or reviewing a PR. Covers the verification checklist that gates every merge.
see_also:
  - .claude/rules/web-security.md
  - .claude/rules/typescript-standards.md
---

# Definition of Done

A feature or fix is not done until every item below is verified.

## 1. All builds pass

```bash
pnpm build
pnpm typecheck
```

All must exit 0 with no errors. Warnings in changed files should be addressed.

## 2. Tests pass

```bash
pnpm test
```

- All existing tests must pass
- New functionality should have corresponding tests (Vitest)
- Cover the happy path plus at least 2 edge cases for game, rating and auth logic

## 3. Browser verification

```bash
pnpm db:up          # Postgres + Redis
pnpm dev            # web on :3000, server on :4000
```

Run the app and verify:
- [ ] The feature works as expected (golden path)
- [ ] Edge cases are handled (empty states, error states)
- [ ] No console crashes or unhandled exceptions
- [ ] Navigation flows work correctly
- [ ] Existing features still work (no regressions)

For realtime changes:
- [ ] Test with two browser windows (two players)
- [ ] Reload and reconnect: state syncs via `SYNC_STATE`
- [ ] Server health check `http://localhost:4000/health` returns ok

## 4. Security checklist

Per `.claude/rules/web-security.md`:
- [ ] No hardcoded secrets in source
- [ ] Credentials stored securely
- [ ] No sensitive data logged
- [ ] New endpoints and WS events validate input and check auth

## 5. Code quality

Per `.claude/rules/typescript-standards.md`:
- [ ] No compiler/lint warnings in changed files
- [ ] `pnpm lint` exits 0
- [ ] Shared types used from `@xiangqi/shared-types`

## 6. Documentation

- [ ] CLAUDE.md updated if architecture changes
- [ ] `README.md` and `.env.example` updated if scripts or env vars change

## Anti-patterns

- "Tests would pass." — **Run them. Paste the exit code.**
- "Builds on my machine." — **Run all variants via command line.**
- "Verified in my head." — **Run the app and test the feature.**
- "The Wasm engine is fine." — **Check it in a real browser, not only in Node.**

## Verification order

1. Build all packages and apps
2. Run tests
3. Run in the browser, verify golden path
4. Check console/logs for errors
5. Test edge cases
6. Verify no regressions in related features

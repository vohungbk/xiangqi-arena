---
description: Run typecheck, lint, test (and build) and report exit codes
argument-hint: [--build]
allowed-tools: Bash(pnpm typecheck:*), Bash(pnpm lint:*), Bash(pnpm test:*), Bash(pnpm build:*), Bash(git diff:*), Bash(git status)
---

Verify the current work. Arguments: $ARGUMENTS

Run these in order. Show the real exit code of each. Do not say "pass" without running.

1. `pnpm typecheck; echo "exit=$?"`
2. `pnpm lint; echo "exit=$?"`
3. `pnpm test; echo "exit=$?"`
4. `pnpm build; echo "exit=$?"` for any app or package that changed (run if `--build` is given or source files changed). Use `pnpm --filter <name> build` when only some packages changed.

## Rules
- Do not stop at the first failure. Run all steps, then report.
- On a failure, show the failing file, line and message. Then propose a fix. Do not fix silently unless the user asked.
- Do not skip, disable or edit tests or lint rules just to get green.

## Output
| Step | Command | Exit code | Result |
|------|---------|-----------|--------|

End with one line: "All green" only if every exit code is 0. Otherwise list what failed.

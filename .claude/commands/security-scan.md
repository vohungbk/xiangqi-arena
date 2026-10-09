---
description: Security scan of dependencies and the current diff against web-security rules
allowed-tools: Bash(pnpm audit:*), Bash(git diff:*), Bash(git status), Bash(git log:*), Read, Grep, Glob
---

Run a security scan on the current branch. Follow `.claude/rules/web-security.md`.

## Steps
1. Dependencies: `pnpm audit --prod; echo "exit=$?"`
2. Secrets in the diff (staged and unstaged, vs `main`):
   ```bash
   git diff main...HEAD | grep -nEi "(api[_-]?key|secret|password|token)\s*[:=]\s*['\"][^'\"]{16,}" || true
   ```
3. Files that must not be in the diff: `.env`, `.env.*` (except `.env.example`), `dist`, `.next`, `node_modules`.
4. Review the changed code against the checklist:
   - [ ] No hardcoded secrets
   - [ ] No tokens, OTP, passwords or PII in logs
   - [ ] No token in any URL or query string
   - [ ] New REST endpoints have auth guards and DTO validation
   - [ ] WS handlers validate payloads and check the sender owns the game or room
   - [ ] WS handshake checks `Origin` against `ALLOWED_ORIGINS`
   - [ ] Server is authoritative for moves, clocks, ratings
   - [ ] No `$queryRawUnsafe`, no SQL string concatenation
   - [ ] No `dangerouslySetInnerHTML` with user content
   - [ ] No `NEXT_PUBLIC_*` variable holds a secret

## Output
- Findings table: severity (High / Medium / Low), file:line, issue, fix.
- Flag High findings immediately.
- If nothing is found, say which checks were run. Do not claim more than was checked.

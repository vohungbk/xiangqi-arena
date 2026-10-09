# Security Rules

Xiangqi Arena is a TypeScript full-stack app: Next.js (browser) and NestJS (REST + Socket.io). Auth uses OAuth 2.0 PKCE, email OTP and JWT.

## Credentials & Session Storage

- Passwords and OTP codes are never stored in plain text. Hash with a slow algorithm (argon2 or bcrypt).
- OAuth uses PKCE. The `code_verifier` stays in memory or `sessionStorage` for the single flow only.
- Prefer HTTP-only, `Secure`, `SameSite` cookies for refresh tokens. Never put tokens in `localStorage` if a cookie works.
- WebSocket auth: send the access token in the first message (`AUTH_CONNECT`). Never put tokens in the URL or query string.
- Validate the `Origin` header on every WS handshake against `ALLOWED_ORIGINS`.
- Never log tokens, session IDs, OTP codes, passwords or API keys, not even partially masked.
- Credentials must never appear in source code, logs, error messages or URLs.

## Secrets Management

```
.env.example (placeholders, committed) -> .env (real values, git-ignored) -> process.env -> ConfigService
```

- Never commit `.env` or real secrets. Only `.env.example` with placeholder values.
- Read config through Nest `ConfigService`. Do not scatter `process.env` across the code.
- `NEXT_PUBLIC_*` variables are public. Never put secrets in them.
- Rotate `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` per environment. Never reuse dev values in production.

## Transport Security

- Enforce HTTPS/TLS and WSS in production.
- CORS and Socket.io CORS allow only origins from `ALLOWED_ORIGINS`. No `*` with credentials.
- Document any development-only exception with a clear reason.

## Input Validation

Treat all external input as untrusted:

- Validate every REST body and WS payload on the server (DTO + `class-validator` or `zod`). Do not trust client-sent types.
- Server is authoritative for moves, clocks and ratings. Never accept a client-computed result.
- Usernames: ASCII only, 3-20 chars. Room codes: 6 chars from the allowed Base32 alphabet. Rate-limit failed room entries.
- Use Prisma parameterized queries. Never build SQL with string concatenation. Avoid `$queryRawUnsafe`.
- Escape output. Do not use `dangerouslySetInnerHTML` with user content.
- Protect state-changing HTTP endpoints against CSRF when cookies are used.

## Logging

- Never log credentials, tokens, OTP codes, payment details or PII (full emails, names).
- Log user IDs, not emails.
- Remove debug logs that contain sensitive data before merge.

## Pre-commit Security Checklist

Before every commit, verify:

- [ ] No hardcoded secrets in source (API keys, passwords, tokens)
- [ ] Credentials stored securely (hashed passwords, HTTP-only cookies, env vars for secrets)
- [ ] No sensitive data in logs
- [ ] WS handlers validate payloads and check that the sender owns the game or room
- [ ] New endpoints have auth guards and input validation
- [ ] No token in any URL or query string

## Security Scan

Run before opening a PR:

```bash
pnpm audit --prod
git diff --cached | grep -nEi "(api[_-]?key|secret|password|token)\s*[:=]\s*['\"][^'\"]{16,}" || true
```

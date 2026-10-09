# Pull Request

## Related Issue

Closes #

## Summary

Brief description of what changed and why.

---

**Status legend:** Pass | Fail | Block | Skip | Not run

- **Pass** — verified and works as expected
- **Fail** — verified and does not meet the criteria
- **Block** — could not be verified because a blocker/dependency prevents it
- **Skip** — intentionally not applicable / out of scope for this PR
- **Not run** — not yet verified

---

# Acceptance Criteria Verification

Copy **every** Acceptance Criteria row from the ticket verbatim, then set `Status` for each.

| ID   | Criteria | Spec Ref | Status      |
| ---- | -------- | -------- | ----------- |
| AC01 |          |          | **Not run** |
| AC02 |          |          | **Not run** |

---

# Impact Assessment

Based on the **actual code changed in this PR**, list each area a change touches (directly or via shared code/hooks/templates), what could break, and the regression scenario that proves it still works.

| Changed file / module | What changed | Who/what depends on it | Potential regression | Regression scenario verified |
| --------------------- | ------------ | ---------------------- | -------------------- | ---------------------------- |
|                       |              |                        |                      |                              |

---

# Test Coverage

## Verification checklist

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes (Vitest)
- [ ] `pnpm build` passes for changed apps and packages
- [ ] Realtime changes tested with two browser windows
- [ ] Security checklist in `.claude/rules/web-security.md` reviewed

## Manual Testing Performed

What did you test manually to verify this change?

| Test scenario | Expected behavior | Actual result | Status      |
| ------------- | ----------------- | ------------- | ----------- |
|               |                   |               | **Not run** |

## Automated Tests

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] All tests pass locally
- [ ] All tests pass in CI

## Regression Scenarios

Additional flows tested based on the Impact Assessment above:

- [ ] Flow A still works
- [ ] Flow B still works

---

# Evidence

Provide proof for **every** Acceptance Criteria row above. A status without evidence counts as **Not run**.

## Evidence per AC

| AC ID | Evidence type                                 | Evidence (link, file or pasted output) | Status      |
| ----- | --------------------------------------------- | -------------------------------------- | ----------- |
| AC01  | Test output / Screenshot / Log / API response |                                        | **Not run** |
| AC02  |                                               |                                        | **Not run** |

## Command results

| Command          | Exit code |
| ---------------- | --------- |
| `pnpm typecheck` |           |
| `pnpm lint`      |           |
| `pnpm test`      |           |
| `pnpm build`     |           |

## Required

- [ ] Test report summary (Vitest run output / report)
- [ ] Every AC above has at least one evidence entry

## Optional

- Screenshots, videos, logs, API responses, etc.
- Do not include secrets, tokens, OTP codes or PII in evidence.

---

# Bug Fix Analysis

_(Required only for bug fixes)_

## Root Cause

Describe the underlying cause of the issue.

## Introduced By

Link the commit/PR that introduced the issue, if known.

## Solution

Explain how the fix addresses the root cause.

---

# Final Verification

- [ ] All Acceptance Criteria are satisfied.
- [ ] Direct and regression scenarios have been tested.
- [ ] Tests and/or documentation have been updated if needed.

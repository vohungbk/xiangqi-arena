---
description: Read a GitHub ticket, plan against its ACs, wait for approval, then implement
argument-hint: <issue-number> [--plan-only]
allowed-tools: Bash(gh issue view:*), Bash(git status), Bash(git branch:*), Bash(git log:*), Bash(git diff:*), Read, Grep, Glob, Edit, Write, Bash(pnpm:*)
---

Implement ticket: $ARGUMENTS

The ticket already has acceptance criteria (AC). Do not rewrite stories or ACs.

## Phase 1: Read the ticket
1. Parse the issue number from `$ARGUMENTS`. Check for the `--plan-only` flag.
2. Run `gh issue view <number> --repo vohungbk/xiangqi-arena`.
3. Extract: story, every AC (ID + text), assumptions, dependency, test scenarios.
4. Check the branch with `git branch --show-current`. It must match `<type>/<issue>-<slug>`, not `main`. If not, stop and tell the user to run `make worktree-new <branch>`.
5. Check each AC is testable. If an AC is vague or missing, ask the user. Do not guess.

## Phase 2: Explore and plan
1. Explore the repo for the code each AC touches. Follow `.claude/rules/typescript-standards.md`.
2. Output a plan with:
   - AC to task map (one row per AC: files to change, approach)
   - Test plan (happy path + at least 2 edge cases for game, rating, auth logic)
   - Impact surface (what else may break)
   - Security notes (per `.claude/rules/web-security.md`)
   - Open questions
3. Do not edit any file in this phase.

## Phase 3: HARD GATE
Stop after the plan. Ask: "Approve this plan?"
- No code before the user approves in chat.
- If `--plan-only` was given, stop here for good.

## Phase 4: Implement (only after approval)
1. Work task by task, following the approved plan. If the plan must change, stop and ask.
2. Write tests with Vitest. Test names are meaningful, for example "should return error when email is invalid".
3. Use shared types from `@xiangqi/shared-types`. Never redefine them.
4. Run `/code-review` on the changes. Fix the findings that are real, or say why you skip one.
5. Run `/simplify` and apply the fixes.
6. Run `/verify` at the end and show the exit codes. Run it after steps 4 and 5, because they change the code.
7. Do not commit or push unless the user asks. Commit format: `feat(<scope>): <subject>`, tests in a separate `test(<scope>)` commit.

## Output
- Report each AC with a status: Pass / Fail / Block / Not run, and the evidence.

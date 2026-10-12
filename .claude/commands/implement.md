---
description: Read a GitHub ticket and plan against its ACs; implement after the user types approve
argument-hint: <issue-number or issue URL>
allowed-tools: Bash(gh issue view:*), Bash(git status), Bash(git branch:*), Bash(git log:*), Bash(git diff:*), Read, Grep, Glob, Edit, Write, Bash(pnpm:*), Bash(lsof:*), Bash(curl:*), Bash(pkill:*)
---

Implement ticket: $ARGUMENTS

The ticket already has acceptance criteria (AC). Do not rewrite stories or ACs.

## Phase 1: Read the ticket
1. Parse the issue number from `$ARGUMENTS`.
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
- Running `/implement` only plans. Never start Phase 4 in the same turn.
- No code before the user types `approve` in chat. Any reply that approves counts, for example "approve" or "approve, implement theo đề xuất".
- Treat "implement theo đề xuất" as: answer every open question with the recommended option.
- If the reply approves and adds small notes, apply the notes and implement. If the reply only asks for a change or asks a question, update the plan, show it again and ask again. Do not implement yet.

## Phase 4: Implement (only after the user types approve)
1. Work task by task, following the approved plan. If the plan must change, stop and ask.
2. Write tests with Vitest. Test names are meaningful, for example "should return error when email is invalid".
3. Use shared types from `@xiangqi/shared-types`. Never redefine them.
4. Run `/code-review` on the changes. Fix the findings that are real, or say why you skip one.
5. Run `/simplify` and apply the fixes.
6. Run `/verify` at the end and show the exit codes. Run it after steps 4 and 5, because they change the code.
7. Right after step 6 is green, start the dev server for the user to review. Do not ask first.
   - Run it in the background from the worktree root: `pnpm --filter @xiangqi/web dev` (the script runs `next dev -p 3000 --webpack`). Next must start inside `apps/web`, so do not call the `next` binary from the repo root. The `--webpack` flag is needed since Next 16: the config has a custom webpack block for the Wasm engine.
   - Check that port 3000 is free first (`lsof -i :3000`). Check that the server answers HTTP 200 on `http://localhost:3000`.
   - If the feature needs a logged-in user, seed a test user with a temporary uncommitted component. Say so, and remove it before any commit.
   - Give the user the URL, the pages and states to check, and anything known to be missing (for example a page that 404s because another feature owns it).
   - Tell the user how to stop it: `pkill -f "next dev -p 3000"`. Keep it running until the user is done. Stop it before `pnpm build` or removing the worktree.
8. Do not commit or push unless the user asks. Wait for the user's review first, unless they already asked to commit and open the PR. Commit format: `feat(<scope>): <subject>`, tests in a separate `test(<scope>)` commit.

## Output
- Report each AC with a status: Pass / Fail / Block / Not run, and the evidence.
- End with the dev server URL and what to check.

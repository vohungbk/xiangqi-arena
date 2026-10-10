# Git Workflow

## Branch Naming

All feature branches must follow this pattern:

```
<type>/<story-id>-<description>
```

The **story id** is the ticket id in lowercase. `ENG-F02-S03` becomes `eng-f02-s03`.
It is the id in the ticket title, for example `INF-F01-S06: Repository Guide and PR Template`.
A GitHub issue number (`<type>/42-<description>`) or no id (`<type>/<description>`) is still accepted.

**Allowed types:** `feat`, `fix`, `hotfix`, `refactor`, `perf`, `test`, `docs`, `chore`, `security`

**Examples:**
- `feat/eng-f02-s03-move-validation`
- `docs/inf-f01-s06-readme-guide`
- `feat/42-add-feature`
- `fix/broken-link`
- `hotfix/critical-bug`
- `refactor/simplify-logic`
- `security/patch-vulnerability`

**Exempt branches:** `main`, `master`, `develop`, `staging`, `production`

## Commit Message Format

Use Conventional Commits format:

```
<type>(<scope>): <subject>

<optional body>

<optional footer>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `security`

Put the story id in the footer of every commit: `Refs <STORY-ID>` (uppercase, as in the ticket).

**Examples:**
```
feat(game): validate moves on the server

Refs ENG-F02-S03

fix(auth): resolve session timeout issue

Refs ENG-F03-S01
Closes #123

docs(readme): add the repository guide

Refs INF-F01-S06
```

## Pull Request Requirements

Before opening a PR:

- `pnpm typecheck`, `pnpm lint` and `pnpm test` all exit 0
- `pnpm build` passes for any app or package you changed
- New behavior has tests (Vitest)
- No secrets or `.env` files in the diff
- PR title or body names the story id, the body links the issue (`Closes #<number>`) and uses `.github/PULL_REQUEST_TEMPLATE.md`

## Pre-push Checklist

Run before `git push`:

```bash
# Automated by .githooks/pre-push if hooks are enabled
pnpm typecheck && pnpm lint && pnpm test
```

Enable git hooks with:
```bash
make setup  # one-time setup
```

## Force Push Policy

- **Never force push to `main`, `master`, `develop`**
- Force push to feature branches only when necessary (rebasing)
- Always warn collaborators before force pushing a shared branch

## Worktree Workflow

This project uses git worktrees for parallel development.

**IDE Behavior:** Worktrees open in a new window (keeps current window open).

Quick reference:
```bash
make setup                     # one-time setup
make worktree-new <branch>     # create worktree + open IDE
make worktree-switch <branch>  # switch to existing worktree
make worktree-list             # show all worktrees
make worktree-rm <branch>      # remove worktree
```

**Runtime override:**
```bash
# Use environment variable
export CC_WORKTREE_IDE_MODE=new     # new window
export CC_WORKTREE_IDE_MODE=reuse   # replace current window

# Or use command flag
make worktree-new feat/my-branch --ide-mode new
```

Run `pnpm install` in each new worktree (dependencies are not shared).

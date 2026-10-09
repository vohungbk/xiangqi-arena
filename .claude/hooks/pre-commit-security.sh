#!/bin/bash
# Claude Code hook: pre-commit-security
# Scans added lines in the staged diff for hardcoded secrets.
# Exit 2 blocks the tool call and shows stderr to Claude.

echo "🔒 Scanning for hardcoded secrets..." >&2

PATTERN="(api_key|secret|password|token)[A-Za-z_]*[[:space:]]*[=:][[:space:]]*['\"][^'\"]{20,}"

# Only added lines; skip lock files and this hook (it contains the pattern itself)
MATCHES=$(git diff --cached -U0 --no-color -- . ':!pnpm-lock.yaml' ':!.claude/hooks/pre-commit-security.sh' \
  | grep -E '^\+[^+]' | grep -nEi "$PATTERN")

if [ -n "$MATCHES" ]; then
  echo "$MATCHES" >&2
  echo "⚠️  Possible hardcoded secret detected in staged files." >&2
  echo "Review the matches above before committing." >&2
  exit 2
fi

echo "✅ No secrets detected" >&2
exit 0

#!/bin/bash
# Claude Code hook: post-edit-format
# Auto-format files after editing

FILE="$1"

# Check if prettier is available
if command -v npx &> /dev/null; then
  # Only format supported file types
  if [[ "$FILE" =~ \.(ts|tsx|js|jsx|json|css|scss|md)$ ]]; then
    echo "✨ Formatting $FILE..."
    npx prettier --write "$FILE" 2>&1 | grep -v "unchanged"
  fi
fi

exit 0

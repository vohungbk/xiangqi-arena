#!/bin/bash
# Claude Code hook: post-edit-typescript
# Runs a type check in the workspace package that owns the edited file.

FILE="$1"

# Only run for .ts and .tsx files
if [[ "$FILE" =~ \.(ts|tsx)$ ]]; then
  # Walk up to the nearest directory with a package.json and tsconfig.json
  DIR=$(dirname "$FILE")
  while [ "$DIR" != "/" ] && [ ! -f "$DIR/tsconfig.json" ]; do
    DIR=$(dirname "$DIR")
  done
  if [ -f "$DIR/tsconfig.json" ]; then
    echo "🔍 Type checking $DIR..."
    (cd "$DIR" && pnpm exec tsc --noEmit --pretty 2>&1 | head -20)
  fi
fi

exit 0

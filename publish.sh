#!/usr/bin/env bash
# Rebuild the HTML site from notes/ and push any changes to GitHub.
# Usage: ./publish.sh "optional commit message"
set -euo pipefail
cd "$(dirname "$0")"

python3 build.py

git add -A
if git diff --cached --quiet; then
  echo "No changes to publish."
  exit 0
fi

git commit -q -m "${1:-Update study notes}"
git push -q origin HEAD
echo "Published: $(git log -1 --pretty='%h %s')"

#!/usr/bin/env bash
# Usage: upload.sh <pr-number> <outdir>
# Uploads <outdir>/before/*.png and <outdir>/after/*.png to the orphan
# pr-screenshots branch and prints a markdown before/after table.
set -euo pipefail

pr=$1
out=$(realpath "$2")
repo=$(gh repo view --json nameWithOwner -q .nameWithOwner)
branch=pr-screenshots
prefix="pr-$pr/$(date -u +%Y%m%dT%H%M%SZ)"

# Create the orphan branch (one empty commit) the first time
if ! gh api "repos/$repo/branches/$branch" >/dev/null 2>&1; then
  empty=$(git hash-object -t tree /dev/null)
  commit=$(git commit-tree "$empty" -m "PR screenshots")
  git push -q origin "$commit:refs/heads/$branch" 2>/dev/null
fi

sha=
upload() {
  local file=$1 path=$2
  sha=$(gh api -X PUT "repos/$repo/contents/$path" \
    -f message="Screenshots for PR #$pr" -f branch="$branch" \
    -f content="$(base64 -w0 "$file")" --jq .commit.sha)
}

declare -A before after
for side in before after; do
  for f in "$out/$side"/*.png; do
    [ -e "$f" ] || continue
    upload "$f" "$prefix/$side/$(basename "$f")"
    if [ "$side" = before ]; then before[$(basename "$f")]=1; else after[$(basename "$f")]=1; fi
  done
done

url() { echo "https://raw.githubusercontent.com/$repo/$sha/$prefix/$1/$2"; }

echo "| State | Before | After |"
echo "|---|---|---|"
for name in $(printf '%s\n' "${!before[@]}" "${!after[@]}" | sort -u); do
  b=$([ -n "${before[$name]:-}" ] && echo "![]($(url before "$name"))" || echo "_none_")
  a=$([ -n "${after[$name]:-}" ] && echo "![]($(url after "$name"))" || echo "_none_")
  echo "| ${name%.png} | $b | $a |"
done

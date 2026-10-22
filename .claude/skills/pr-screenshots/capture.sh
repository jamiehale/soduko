#!/usr/bin/env bash
# Usage: capture.sh <spec.js> <outdir> [base-ref]
# Runs a Playwright capture spec on the working tree (-> <outdir>/after) and on
# base-ref in a temporary worktree (-> <outdir>/before). base-ref defaults to
# where the branch left origin/main, which stays right after a squash merge.
set -euo pipefail

spec=$(realpath "$1")
out=$(realpath -m "$2")
base=${3:-}
repo=$(git rev-parse --show-toplevel)
name=zz-pr-screenshots.spec.js

stop_server() {
  local pid
  pid=$(ss -ltnpH 'sport = :3000' 2>/dev/null | grep -oP 'pid=\K[0-9]+' | head -1 || true)
  if [ -n "$pid" ]; then kill "$pid"; sleep 1; fi
}

run() {
  local dir=$1 dest=$2
  mkdir -p "$dest"
  cp "$spec" "$dir/e2e/$name"
  stop_server
  (cd "$dir" && SHOT_DIR="$dest" npx playwright test "e2e/$name" --reporter=line) || status=$?
  rm -f "$dir/e2e/$name"
  stop_server
  return "${status:-0}"
}

rm -rf "$out/before" "$out/after"
run "$repo" "$out/after"

git fetch -q origin
base=${base:-$(git merge-base origin/main HEAD)}
tmp=$(mktemp -d)
git worktree add -q --detach "$tmp" "$base"
trap 'git -C "$repo" worktree remove --force "$tmp"' EXIT
ln -s "$repo/node_modules" "$tmp/node_modules"
run "$tmp" "$out/before"

echo "before: $(ls "$out/before" | tr '\n' ' ')"
echo "after:  $(ls "$out/after" | tr '\n' ' ')"

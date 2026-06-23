#!/bin/bash
set -e

yarn build

git worktree prune

WORKTREE=$(mktemp -d)
trap "git worktree remove --force '$WORKTREE' 2>/dev/null || true" EXIT

git worktree add "$WORKTREE" gh-pages
rsync -a --delete --exclude='.git' dist/ "$WORKTREE"/

git -C "$WORKTREE" add -A
git -C "$WORKTREE" commit -m "deploy $(date '+%Y-%m-%d %H:%M')"
git -C "$WORKTREE" push origin gh-pages

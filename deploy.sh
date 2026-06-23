#!/bin/bash
set -e

yarn build

WORKTREE=$(mktemp -d)
git worktree add "$WORKTREE" gh-pages

rsync -a --delete dist/ "$WORKTREE"/

git -C "$WORKTREE" add -A
git -C "$WORKTREE" commit -m "deploy $(date '+%Y-%m-%d %H:%M')"
git -C "$WORKTREE" push origin gh-pages

git worktree remove "$WORKTREE"

---
name: auto-commit-push
description: Automatically commit and push to GitHub after every file change in this repo. Use when the user asks to commit/push changes, save work to GitHub, or asks how the auto-commit behavior works.
---

# Auto Commit & Push

After every file change (Edit / Write), the changes are committed and pushed to `origin` automatically.

## How it works

A `PostToolUse` hook in `.claude/settings.json` (matcher `Edit|Write|MultiEdit`) runs
`SPEC.MD/auto-commit-push/auto-commit-push.ps1`, which:

1. Runs `git add -A`.
2. Exits silently if nothing is staged.
3. Commits with the message `Auto: update <changed files>`.
4. Runs `git push` to the current branch's upstream.

A skill by itself cannot fire on every change; the hook is what makes it automatic.
This skill documents the behavior and covers manual runs.

## Manual run

If the hook did not fire (or a push failed), run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File SPEC.MD/auto-commit-push/auto-commit-push.ps1
```

## Rules

- Never force-push and never rewrite history.
- If the push fails (no network, rejected), report the error; do not retry with `--force`.
- Files that should not be published go in `.gitignore` before they are created.

## Disable

Remove the `PostToolUse` entry from `.claude/settings.json`.

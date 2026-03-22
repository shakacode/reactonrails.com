# CLAUDE.md

Tool-specific guidance for Claude Code in this repository.

## Source of Truth

`AGENTS.md` is the canonical policy for:

- Commands and build workflow
- Code style and formatting expectations
- Git/PR boundaries and safety rules
- Project structure

If this file conflicts with `AGENTS.md`, follow `AGENTS.md`.

## Behavioral Defaults

- When confident in your changes, **commit and push without asking for permission**. Always monitor CI after pushing.

## Git Safety

- **NEVER force-push** (`--force`, `--force-with-lease`) unless the user explicitly requests it. Force-pushing destroys commit history that may represent significant prior work.
- **NEVER `git reset --hard`** on a branch that has existing commits (yours or others'). This destroys work.
- When you need to start fresh or test something without affecting an existing branch, **use a git worktree** (`git worktree add`) or **create a new branch** instead of resetting the current one.
- If a rebase has conflicts, abort and ask the user how to proceed rather than force-pushing a rewritten history.

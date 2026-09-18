---
description: "Create a feature branch from the latest main branch and apply an OpenSpec change"
---

# Branch and Apply

Prepare an isolated branch, then implement an OpenSpec change with the
`/opsx-apply` workflow.

## Usage

```text
/branch-and-apply <change-name> [branch-name]
```

- `change-name` is optional when exactly one active change exists or the change
  is unambiguous from the conversation.
- `branch-name` is optional. When omitted, derive a concise
  `type/short-description` name, normally `feat/<change-name>`.

## Workflow

1. Resolve the OpenSpec change. If it is ambiguous, list active changes and ask
   the user to choose one.
2. Inspect the current branch and worktree before switching branches. Preserve
   all existing changes and never discard, overwrite, or commit unrelated work.
3. Fetch `origin`, switch to `main`, and update it with a fast-forward-only pull:

   ```bash
   git fetch origin
   git switch main
   git pull --ff-only origin main
   ```

   If local changes prevent a safe switch or update, stop and ask the user how
   to proceed. Do not stash automatically.
4. Create and switch to the feature branch:

   ```bash
   git switch -c <branch-name>
   ```

   If the branch already exists, confirm that it is the intended branch and
   switch to it without recreating it.
5. Invoke `/opsx-apply <change-name>` and follow that workflow through
   implementation and validation.

## Completion

Report the selected change, branch name, implementation progress, validation
result, and any remaining blockers. Leave completed changes uncommitted unless
the user separately requests the commit-and-PR workflow.

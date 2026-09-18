---
description: "Archive an OpenSpec change, commit its implementation, push the branch, and open a pull request"
---

# Commit and Raise PR

Finalize a completed OpenSpec change and open a pull request against `main`.

## Usage

```text
/commit-and-raise-pr <change-name>
```

`change-name` is optional when exactly one active change exists or the change is
unambiguous from the conversation.

## Workflow

1. Resolve the OpenSpec change and confirm its implementation tasks and required
   validation are complete.
2. Confirm the current branch is a feature branch, not `main`. Never commit
   directly to `main`.
3. Inspect the complete worktree diff. Keep unrelated or user-owned files out of
   the commit, and stop for clarification if the intended scope is uncertain.
4. Invoke `/opsx-archive <change-name>` and choose **Sync now (recommended)**
   whenever delta specs are not yet reflected in the main specs. Verify the
   synchronized main specs before allowing the archive to proceed. Do not
   continue if synchronization, archiving, or required validation fails.
5. Review the post-archive diff, then stage only files belonging to the change.
6. Create one concise conventional commit. Include this trailer unless the user
   explicitly asks not to:

   ```text
   Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
   ```

7. Push the current branch and establish upstream tracking:

   ```bash
   git push --set-upstream origin <branch-name>
   ```

8. Open a pull request against `main` with `gh pr create`. Use a concise title
   and a body containing:
   - a short summary of the user-visible and technical changes;
   - the validation commands and outcomes;
   - any known limitations or residual risks.
9. Verify the pull request URL and repository status.

## Completion

Report the commit SHA, pushed branch, pull request link, validation result, and
any files intentionally left uncommitted.

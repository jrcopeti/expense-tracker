---
name: parallel-work
description: Set up Git worktrees so several features can be developed in parallel, one isolated checkout per feature at ../expense-tracker-[feature-name] on branch feature/[feature-name].
argument-hint: "[feature-names]"
disable-model-invocation: true
---

Set up a parallel worktree environment for these features: $ARGUMENTS

Think about how to divide the work up into separate features unless this has
been clearly explained already.

1. For each feature mentioned, create a worktree at
   `../expense-tracker-[feature-name]` with branch `feature/[feature-name]`.
2. Set up the development environment in each worktree.
3. List all worktrees to confirm they were created.
4. Explain what each worktree will contain and how they're isolated.

The goal is to work on all features simultaneously without conflicts.

Related: use `/integrate-parallel-worktrees` to merge the results back.

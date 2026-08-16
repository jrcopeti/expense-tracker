---
name: integrate-parallel-worktrees
description: Merge features developed in parallel worktrees into a single integration branch, resolve conflicts, verify the suite passes, then land the result on main and clean up.
argument-hint: "[feature-names]"
disable-model-invocation: true
---

Integrate these features developed in parallel worktrees: $ARGUMENTS

1. Create a new integration branch called `integration/parallel-features`.
2. For each feature name provided, merge branch `feature/[feature-name]` into
   the integration branch.
3. Resolve any merge conflicts that arise.
4. Test that all features work together.
5. Run `npm run build` and `npm test` to ensure nothing is broken — per
   `CLAUDE.md`, don't proceed on a red build or a failing test.
6. Once integration is successful, open a pull request against `main` and
   clean up the feature branches and their worktrees after it merges.

Integrate safely before anything reaches `main`.

Related: `/parallel-work` sets up the worktrees this skill consumes.

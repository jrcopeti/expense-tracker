---
name: code-review-expense-tracker
description: Review a file against this project's conventions and write the critique to ai-code-reviews/. Checks "use client" placement, semantic Tailwind tokens, @/* import alias, and <Component>Props naming against the repo's exemplar files.
when_to_use: Use when asked to review, critique, or check a file in this repo against project conventions. For a general branch-wide review, prefer the built-in /code-review.
argument-hint: "[file-path]"
allowed-tools: Read Grep Glob
---

Carefully perform a comprehensive code review of $ARGUMENTS.

## Review standards

Examples of excellent code that you should match the design/style/conventions of:

- `components/ui/Button.tsx` (React components — variant/size class maps, `clsx`, `forwardRef`)
- `lib/expense-utils.ts` (utility functions — pure functions, JSDoc on non-obvious behavior)
- `hooks/useExpenses.ts` (custom hooks — `"use client"`, `useSyncExternalStore`, `useCallback`, toast-on-failure pattern)

Project-specific conventions to check against, beyond the exemplars themselves:

- Client vs. server components: a `"use client"` directive should be present only when the file actually needs it (hooks, event handlers, browser APIs) — flag it missing where required, or present where the component is purely presentational.
- Styling: Tailwind utility classes via `clsx`, using this project's semantic tokens (`text-foreground`, `text-secondary`, `bg-surface`, `border-border`, etc.) and CSS custom properties (e.g. `--cat-*`) rather than raw hex values or ad hoc colors.
- Path imports use the `@/*` alias (see `tsconfig.json`), not relative `../../` chains.
- Props interfaces are named `<Component>Props` and colocated above the component.

## Process

1. **First**: Read the example files above to understand our design patterns, naming conventions, and code style
2. **Second**: Analyze $ARGUMENTS against these standards
3. **Third**: Create detailed critique covering:
   - Code structure and organization
   - Adherence to established patterns
   - Performance considerations
   - Security implications
   - Maintainability concerns
   - Test coverage — this project runs Vitest with tests colocated as `<name>.test.ts(x)`; per `CLAUDE.md` new or changed code is expected to come with tests, so treat a missing test for touched code as a real gap

## Output requirements

- Save review as `ai-code-reviews/{filename}.review.md` for each file reviewed
- Include specific line references for issues
- Provide concrete suggestions for improvements
- Rate overall quality: Excellent/Good/Needs Improvement/Poor
- Estimate refactoring effort: Low/Medium/High

## Review checklist

- Follows project naming conventions
- Proper error handling implemented
- No hardcoded values, secrets, or magic numbers
- Appropriate comments and documentation
- Follows existing design principles and consistent with exemplars
- No obvious security vulnerabilities
- Performance optimizations considered

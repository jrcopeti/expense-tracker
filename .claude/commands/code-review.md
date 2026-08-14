# Code Review Command

Carefully perform a comprehensive code review of $ARGUMENTS.

## Review Standards
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
   - Test coverage gaps (note only — this project has no test framework configured yet, so treat this as informational, not a defect to penalize)

## Output Requirements
- Save review as `ai-code-reviews/{filename}.review.md` for each file reviewed
- Include specific line references for issues
- Provide concrete suggestions for improvements
- Rate overall quality: Excellent/Good/Needs Improvement/Poor
- Estimate refactoring effort: Low/Medium/High

## Review Checklist
- Follows project naming conventions
- Proper error handling implemented
- No hardcoded values, secrets, or magic numbers
- Appropriate comments and documentation
- Follows existing design principles and consistent with exemplars
- No obvious security vulnerabilities
- Performance optimizations considered

# Document Feature Command

Generate paired documentation — one technical, one user-facing — for the
feature named **$ARGUMENTS**.

This is a client-only Next.js app (App Router, no server/API routes,
`localStorage` persistence — see `README.md`). "Backend" here means the
data/state layer (`lib/*Store.ts`, `lib/storage.ts`, `lib/validation.ts`,
custom hooks), not a server. If this project ever grows an `app/api/**`
directory, treat that as backend too.

## Process

### 1. Resolve the feature and find its code

- Turn `$ARGUMENTS` into a kebab-case slug (e.g. "password reset" →
  `password-reset`).
- Search the codebase for files whose names, exports, or content relate to
  the feature: check `app/`, `components/`, `hooks/`, `lib/` for matches on
  the feature name and its obvious synonyms. Read every match before writing
  anything — don't document from the feature name alone.
- If nothing plausible is found, say so and ask the user to point at the
  relevant files instead of guessing.

### 2. Classify the feature

Based on which layers the matched files live in:
- **Frontend-only** — only `components/`, `app/**/page.tsx`/`layout.tsx`, or
  presentational hooks are touched.
- **Data-layer ("backend")** — only `lib/*Store.ts`, `lib/storage.ts`,
  `lib/validation.ts`, or similar state/persistence/business-logic files are
  touched, with no new UI.
- **Full-stack** — both.

Let this drive which sections you fill in below (e.g. a data-layer-only
feature gets a thin or absent "UI walkthrough" section in the user doc, but
still needs the technical doc).

### 3. Find related existing docs to cross-link

- Grep `docs/dev/` and `docs/user/` for the feature's keywords and for the
  names of any components/lib modules it shares with other documented
  features.
- Also check `README.md`'s "Project structure" section for a one-line
  description of any module the feature touches or extends.
- Every match becomes a "Related docs" link in both generated files — don't
  skip this even if it only turns up one link.

### 4. Capture screenshots for the user doc

Try this first, don't skip straight to placeholders:
1. Use the `run` skill to launch the app.
2. Use `claude-in-chrome` to navigate to the relevant screen(s) and capture
   one screenshot per step of the user walkthrough.
3. Save each capture to `docs/user/screenshots/{slug}-{step-number}.png` and
   embed it inline: `![Step N: <what it shows>](screenshots/{slug}-{step-number}.png)`.

If the app can't be launched, the feature has no reachable UI (data-layer-only),
or browser automation isn't available/permitted, fall back to an explicit
placeholder instead of skipping the visual — never leave a step without
either a real screenshot or a marked placeholder:

```
<!-- SCREENSHOT: <what this should show, e.g. "Settings modal with the new daily-budget field visible"> -->
```

### 5. Write the two files

Follow the existing repo voice: `README.md`'s "Manually testing everything"
section is the model for user-doc tone (short numbered steps, concrete
example inputs, describe what confirms success) and its "Project structure"
section is the model for dev-doc terseness (file paths, one line of intent
each, no filler).

## Output Requirements

Generate exactly two files:

- `docs/dev/{slug}-implementation.md`
- `docs/user/how-to-{slug}.md` — phrase the slug as a natural imperative
  when the feature name allows it (e.g. feature "password reset" →
  `how-to-reset-password.md`); otherwise fall back to
  `how-to-{slug}.md` using the slug from step 1.

**`docs/dev/{slug}-implementation.md`** must include:
- One-line summary and the classification from step 2.
- Relevant files, each as `path:line` with a one-line note on its role.
- Data flow / state shape touched (reference the actual types from
  `lib/types.ts` if any apply).
- API details — only if the feature adds/changes anything under `app/api/**`;
  omit this section entirely otherwise rather than writing "N/A".
- Edge cases and error handling actually present in the code (not
  hypothetical ones) — e.g. the `PERSIST_WARNING` toast pattern in
  `hooks/useExpenses.ts` for storage failures, if relevant.
- A "For end users" link to the paired user doc.
- A "Related docs" list from step 3.

**`docs/user/how-to-{slug}.md`** must include:
- A one-sentence plain-language description of what the feature does for
  the user (no implementation detail).
- Numbered step-by-step instructions, each with a screenshot or placeholder
  from step 4.
- A "Technical details" link to the paired dev doc, for anyone who wants it.
- A "Related guides" list from step 3.

## Checklist before finishing

- Both files exist at the exact paths above.
- Every code claim in the dev doc is backed by a file you actually read this
  session, cited as `path:line`.
- Every user-doc step has a screenshot or an explicit placeholder — none
  silently missing.
- Both files link to each other, and both link to at least one related doc
  if step 3 found any.
- Feature classification (frontend/data-layer/full-stack) is stated in the
  dev doc and reflected in which sections got written.

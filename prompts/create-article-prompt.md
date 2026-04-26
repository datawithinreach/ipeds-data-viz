# Create article from IPEDS CSV (AI instructions)

Use this document as the **task spec** for generating a new article from a **user-supplied CSV**. Follow the phases in order unless the user explicitly skips a step.

---

## Role

Turn a user-provided CSV into a new article in this repo: understand the data, help choose a template + slug, then scaffold the new article files.

---

## Hard constraints (non-negotiable)

1. **Source data is read-only**: do not edit the user-supplied CSV contents (or any other “source” data they provided).
2. **No duplicates**: before finalizing a slug or creating paths, check existing slugs/folders; never reuse an existing slug/folder name.
3. **Exactly three files per new article** in one folder:
   - `app/article/<slug>/index.mdx`
   - `app/article/<slug>/page.tsx`
   - `app/article/<slug>/<slug>.csv`
4. **Move (don’t recreate) the CSV**: place the user’s CSV into the article folder via a single move+rename (e.g. `mv <source.csv> app/article/<slug>/<slug>.csv`). Do not duplicate or regenerate the CSV.
5. **MDX compilation safety**: never put comments of any kind in `.mdx` files (no `//`, `/* */`, or `<!-- -->`). Put notes in the final handoff message instead.
6. **Use existing visualization components only**: in `index.mdx` and `page.tsx`, only use chart/viz components that already exist under `visualizations/`. Do not add new charting libraries or one-off custom viz components outside `visualizations/`.
7. **All numbers must come from the CSV**: any numeric value shown anywhere (chart arrays, `<Banner>` values, titles/subtitles containing numbers, body copy) must be computed from the provided CSV and cross-checked against it. Never eyeball or reuse numbers from memory/other articles.
8. **Close with a file-oriented handoff**: after making repo changes, end with (a) files created/modified, (b) files the user should edit next, (c) one sentence on what’s rough vs production-ready.

---

## Required input from the user

- One CSV file (path or pasted content).

If the CSV is missing, ask for it and stop.

---

## Phase 1 — Understand the CSV + choose a template

After you have the CSV:

- **Summarize the data**:
  - Infer what each column represents and what comparisons/trends are possible.
  - Treat the CSV as a **comparison set of schools**.
  - Identify each school’s **category/group** (from a column, filename, or topic). If there’s a shared/common category across the set, call it out explicitly.

- **Template options**:
  - Inspect the repo’s `templates/` directory.
  - Propose **exactly 3** best-fit templates for this CSV/story **plus** a 4th option: **Custom**.
  - Option labels must be: `<templateName> — <one sentence on why/when to use it for this CSV>`
  - Custom label must be: `Custom — I will specify my own structure / charts (see Phase 3)`

- **Ask exactly one question** (template choice) using the interactive picker when available; otherwise use the fallback format below.

Interactive (Phase 1):

```json
{
  "title": "Phase 1 — Choose a template",
  "questions": [
    {
      "id": "template_choice",
      "prompt": "Choose a template.",
      "options": [
        { "id": "<template-1>", "label": "<template-1> — <why/when to use it for this CSV>" },
        { "id": "<template-2>", "label": "<template-2> — <why/when to use it for this CSV>" },
        { "id": "<template-3>", "label": "<template-3> — <why/when to use it for this CSV>" },
        { "id": "custom", "label": "Custom — I will specify my own structure / charts (see Phase 3)" }
      ]
    }
  ]
}
```

Fallback (Phase 1):

```text
Choose a template:
1) <template-1> — <why/when to use it for this CSV>
2) <template-2> — <why/when to use it for this CSV>
3) <template-3> — <why/when to use it for this CSV>
4) Custom — I will specify my own structure / charts (see Phase 3)
```

If the user selects **Custom**, ask (in a follow-up message) which **existing** visualization components they want (e.g., bar chart, map, small multiples), then wait for that list before scaffolding.

---

## Phase 2 — Choose the URL slug

Propose **3** URL-friendly slugs derived from the topic **and the actual CSV contents**, plus a custom option.

- Slugs must reflect what’s truly present (years, geography, institution types, curated/small list vs broad universe).
- Do not imply a broader dataset (e.g. “all-us-colleges”, “top-100”) unless the CSV supports it.

**Interactive requirement**:

- Ask as a **second** single-question picker **only after** Phase 1 is answered.
- Do not combine template + slug into one UI request.
- Immediately after Phase 1 is answered, the next assistant message should be the Phase 2 picker call (no extra narrative in between).

Interactive (Phase 2):

```json
{
  "title": "Phase 2 — Choose a URL slug",
  "questions": [
    {
      "id": "slug_choice",
      "prompt": "Choose a URL slug.",
      "options": [
        { "id": "1", "label": "<slug-one>" },
        { "id": "2", "label": "<slug-two>" },
        { "id": "3", "label": "<slug-three>" },
        { "id": "4", "label": "Custom — I will type my own slug" }
      ]
    }
  ]
}
```

Fallback (Phase 2):

```text
Choose a URL slug:
1) <slug-one>
2) <slug-two>
3) <slug-three>
4) Custom — I will type my own slug
```

If the user chooses custom, ask for the exact slug (lowercase, hyphens, no spaces) and validate it does not collide with an existing article slug.

---

## Repo layout (this project)

- Articles live under `app/article/<slug>/`.
- Each article folder contains:
  - `index.mdx` (exports `ArticleMeta`; copy patterns from `app/article/uc-2024-cost-of-attendance/` or another existing article)
  - `page.tsx`
  - `<slug>.csv`
- After adding a new article folder, regenerate the registry:
  - `node scripts/generate-article-registry.mjs`
  - This updates `app/article/registry.ts` (auto-generated; do not hand-edit).
- Before finalizing a slug, check for existing slugs via `app/article/registry.ts` and/or listing `app/article/*/`.

---

## Phase 3 — Scaffold the article (repo changes)

Before writing anything, **search the repo for the chosen slug** (folder name and references). If there’s a conflict, stop and request a new slug or a merge strategy.

### A) User chose a pre-defined template (one of the 3)

- Identify the closest matching official starter (template or existing article).
- Copy it into `app/article/<slug>/` **as-is**.
  - Do not add/remove/reorder/refactor template content.
  - Make only the minimum changes required for it to work in the new location (e.g. import paths, slug in metadata).
- Move the user CSV into place and rename to `<slug>.csv` (see hard constraints).

### B) User chose Custom

Do not copy a full existing article template as the primary path. Instead:

- Create `app/article/<slug>/`.
- Add the **existing** visualization components the user requested (keep charts simple).
- Keep body copy minimal (title + short paragraphs) that reflect the content. 
- Content must match the data.
- Move the user CSV into place and rename to `<slug>.csv` (see hard constraints).

---

## Phase 4 — Handoff message (required)

End implementation with:

1. Files created or modified (paths, one per line).
2. Files the user should edit next (copy, real data binding, chart tuning, colors, annotations, accessibility text).


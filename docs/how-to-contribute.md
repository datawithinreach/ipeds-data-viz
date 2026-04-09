# How to Contribute

This guide explains the workflow for creating a new article (data story) using the **MDX** authoring format.

## Prerequisites

- Node.js `>= 20.9.0`
- `pnpm` `>= 9.x`

Verify your environment:

```bash
node -v
pnpm -v
```

Install or upgrade pnpm if needed:

```bash
npm install -g pnpm@latest
```

This repository is pnpm-only: `package.json` defines pnpm engine rules, and `.npmrc` enforces them with `engine-strict=true`.

## Article Workflow

### 1) Choose your data source and question

Start by selecting the dataset and the specific question your article will answer.

Examples:

- A trend over time
- A comparison across institutions
- A breakdown by category or demographic

### 2) Clone the repository and install dependencies

```bash
git clone https://github.com/datawithinreach/ipeds-data-viz.git
cd ipeds-data-viz
git checkout -b <your-branch-name>
pnpm install
```

### 3) Scaffold a new article from a template

```bash
pnpm run create:article
```

This script will ask you to choose from an existing template. You can find the available [templates here](./templates.md).

Select a template on the terminal and input a URL-friendly slug. This should create `app/article/<slug>/article.mdx` and `app/article/<slug>/page.tsx`.

Start the application locally running `pnpm run dev`. This should start the application on `localhost:3000`. Navigate to `http://localhost:3000/article/<your-slug>`. You can see new changes appear on save.

### 4) Write your article content

Articles live under `app/article/<slug>/` and use **two files**:

- `article.mdx`: **the story module** (metadata + data + markdown + chart JSX)
- `page.tsx`: Next.js page wrapper that renders the MDX and uses `ArticleMeta` for the header and SEO

Edit **primarily** `app/article/<slug>/article.mdx`.

#### Required: `ArticleMeta`

Your MDX file must export a constant named `ArticleMeta` with these required fields:

- `title`: `<h1>` and SEO title
- `description`: subtitle and SEO description
- `publishDate`: shown in the article header (use a consistent string format, e.g. `MM-DD-YYYY`)
- `source`: citation shown in the footer “Source” block
- `category`: label above the title (e.g. `Admissions`, `Financial`)
- `tags`: string array for listing / filtering
- `href`: canonical route path, **must be** `/article/<slug>` and match the folder name
- `imageUrl` (optional): preview image path (see “Landing page story card image” below)

#### Data + visuals live in the same MDX file

Write narrative text as **plain Markdown** (headings, paragraphs, lists). Use **JSX only** for visual components like `BarChart`, `LineChart`, `Banner`, and `SectionDivider` (these are registered in `mdx-components.tsx`, so no import lines are needed in MDX).



#### Landing page story card image

To set a custom image for the landing page story card:

1. Add your image file to `public/images/landing/` (for example: `public/images/landing/my-story.png`).
2. In `app/article/<slug>/article.mdx`, set `ArticleMeta.imageUrl` to the public path:

```ts
imageUrl: '/images/landing/my-story.png',
```

Notes:

- If `imageUrl` is missing or points to a non-existent local file, the app automatically falls back to `/images/landing/story1.png`.

### 5) Regenerate the article registry

After your article, navigate back to the home page (`http://localhost:3000`). If you see your story appear on the landing page, move to step 6. If not, run the following steps.

- Stop the current instance of the application.
- Run `pnpm run generate:article-registry`.
- Run `pnpm run dev` to reboot the application.

This updates `app/article/registry.ts` so the new article appears on the landing page. You should see it as the first entry.
Do not manually edit `app/article/registry.ts`; it is auto-generated.

### 6) Validate locally

Check that:

- The article card appears on the landing page
- Labels, values, and **source** are accurate
- Charts render correctly and labels do not overlap

### 7) Open a pull request

Push your branch and open a PR:

```bash
git add -A
git commit -m "<your-commit-message>"
git push -u origin <your-branch-name>
```

Your PR should include:

- New files in `app/article/<slug>/`
- New image in `public/images/landing/`
- Automatically updated `app/article/registry.ts`

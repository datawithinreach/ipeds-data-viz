# How to Contribute

This guide explains the workflow for creating a new article.

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

First, start the application locally.

```bash
pnpm run dev
```

This runs the site on localhost:3000 and automatically refreshes the page as you save changes. Then run the command below to scaffold a new article from a template.

```bash
pnpm run create:article
```

This script will ask you to choose from an existing template. You can find the available [templates here](./templates.md). 

Select a template on the terminal and input a URL-friendly slug. This should create `app/article/<slug>/content.ts` and `app/article/<slug>/page.tsx`

### 4) Write your article content

Edit **only** the generated `app/article/<slug>/content.ts` file for article-specific updates.

Replace placeholders in:
- `ArticleMeta` (`title`, `description`, `publishedAt`, `source`, `tags`, `href`, `imageUrl`, `cardDescription`)
- Section text
- Chart data and chart options
- Banner or callout values
Proper instructions are documented in `app/article/<slug>/content.ts`.

#### Landing page story card image

To set a custom image for the landing page story card:

1. Add your image file to `public/images/landing/` (for example: `public/images/landing/my-story.png`).
2. In `app/article/<slug>/content.ts`, set `ArticleMeta.imageUrl` to the public path:

```ts
imageUrl: '/images/landing/my-story.png',
```

Notes:
- If `imageUrl` is missing or points to a non-existent local file, the app automatically falls back to `/images/landing/story1.png`.


### 5) Regenerate the article registry

After content is finalized, run:

```bash
pnpm run generate:article-registry
```

This updates `app/article/registry.ts` so the new article appears on the landing page. You should see it as the first entry.
Do not manually edit `app/article/registry.ts`; it is auto-generated.

### 6) Validate locally

Check that:
- The article card appears on the landing page
- Labels, values, and **source** are accurate


### 7) Open a pull request

Push your branch and open a PR:

```bash
git push -u origin <your-branch-name> 
```

Your PR should include:
- New files in `app/article/<slug>/`
- New image in `public/images/landing/`
- Automatically updated `app/article/registry.ts`

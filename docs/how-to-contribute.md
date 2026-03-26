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

```bash
pnpm run create:article
```

This script will ask you to choose from an existing template. You can find the available [templates here](./templates.md). 

Select a template on the terminal and input a URL-friendly slug. This should create `app/article/<slug>/content.ts` and `app/article/<slug>/page.tsx`

Start the application locally running `pnpm run dev`. This should start the application on `localhost:3000`. Navigate to `http://localhost:3000/article/<your-slug>`. You can see new changes appear on save.

### 4) Write your article content

Edit **only** the generated `app/article/<slug>/content.ts` file for article-specific updates.

Replace placeholders in:
- `ArticleMeta` (`title`, `description`, `publishDate`, `source`, `tags`, `href`, `imageUrl`, `cardDescription`)
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

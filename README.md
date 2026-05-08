# IPEDS Data Visualization Platform

A data visualization platform inspired by [Our World in Data](https://ourworldindata.org/), designed to transform Boston College institutional data into interactive, accessible visual narratives.

## Getting Started

For full setup instructions, contribution guidelines, and component documentation, run the docs site locally:

```bash
cd docs
pnpm install
pnpm run start
```

This starts the docs app at `http://localhost:8000/ipeds-data-viz/`. Alternatively, browse the contributor guides directly at [`docs/docs/`](./docs/docs/), starting with [`how-to-contribute.md`](./docs/docs/how-to-contribute.md).

## Project Overview

This project addresses the challenge of processing complex institutional data derived from the **Integrated Postsecondary Education Data System (IPEDS)** and rendering it through a highly interactive, accessible frontend, focusing on Boston College data and statistics.

## Contributing

Data stories live under `app/article/<slug>/` as **MDX** (`article.mdx`) plus a small `page.tsx`. For authoring steps, required `ArticleMeta` fields, inline chart data, and registry commands, see **[`docs/how-to-contribute.md`](./docs/docs/how-to-contribute.md)**.

## TODO

- **Branch rules for `main`**
  - Right now, this is using GitHub Pages and is served from the `main` branch. Add rules so that no pushes are allowed to this branch, and any new changes must be created from a PR.

- **API exploration**
  - There are existing APIs (College Scorecard, Urban Institute Data) that could provide data programmatically, but they are not the most up-to-date. Continue exploring further options for reliable, current data sources.

- **Vercel Deployent**
  - If we integrate live API calls, we would need to migrate deployment from GitHub Pages to Vercel (or similar), since GitHub Pages only serves static content from the `main` branch.

- **Data exploration for users**
  - Currently, users have to obtain CSV data externally before writing articles. Explore ways to let users look up and browse data directly within the application, making the data discovery process easier and more self-contained.

- **Alternative contribution workflows**
  - Explore providing an interface for users to contribute articles without having to clone the repository.

- **AI integration**
  - Explore how AI can assist in article creation (e.g. generating draft narratives from data, suggesting visualizations, auto-summarizing trends).

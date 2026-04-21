# Architecture

This project is a Next.js App Router application for publishing IPEDS-focused
data stories with reusable visualization components.

## High-level layout

```
ipeds-data-viz/
├── app/                          # App Router pages and route segments
│   ├── page.tsx                  # Landing page
│   └── article/                  # Article routes and generated registry
├── components/
│   ├── article/                  # Shared article layout + content primitives
│   ├── layout/                   # Site-level UI (navbar, footer, story cards)
│   └── visualizations/           # Chart/banner components
├── scripts/                      # Build/dev helpers (registry generation)
├── styles/                       # Shared SCSS variables and themes 
├── templates/                    # Starter templates for new articles 
└── docs/                         # Contributor and architecture docs
```

## Content model

- Every article folder under `app/article/<slug>/` owns:
  - a `content.ts` file with typed metadata and chart/content config
  - a `page.tsx` file that renders the story using shared components
- `scripts/generate-article-registry.mjs` scans article folders and generates
  `app/article/registry.ts`.
- `StoryCardData` consumes that registry to populate landing-page cards.

## Styling approach

- Global and shared style tokens live in `styles/`.
- Feature and component styles are colocated as `.scss` files.
- Article UI uses shared styles in `components/article/article.scss`.


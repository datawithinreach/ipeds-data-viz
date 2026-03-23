import type { ArticleMeta as ArticleMetaType } from '@/components/article';

// ===============================================================
// ARTICLE METADATA
// Shown in the page header, <title>, and <meta description>.
// ===============================================================

export const ArticleMeta: ArticleMetaType = {
  title: 'Your Article Title',
  description: 'A short summary of what this article covers.',
  publishDate: '03-01-2025',
  source:
    'Source: Replace with your data source attribution (e.g. IPEDS, National Center for Education Statistics).',
  imageUrl: '/images/landing/story1.png',
  tags: ['tag-1', 'tag-2'],
  category: "Data Analysis",
  href: '/article/your-article-slug',
};

// ===============================================================
// SECTION CONTENT
// Each section has a heading and one or more paragraphs.
// ===============================================================

export const sections = [
  {
    heading: 'Section Heading',
    paragraphs: [
      'Replace this paragraph with your trend analysis. Describe the patterns visible over time, note inflection points, and give the reader context for interpreting the line chart above.',
    ],
  },
  {
    heading: 'Another Section',
    paragraphs: [
      'Add more sections as needed. Each section can have its own chart, banner, or callout — configure them in this file and render them in page.tsx.',
    ],
  },
];

/* ================================================================
   BANNER
   Optional. Set to null to hide the banner.
   ================================================================ */

export const banner: { value: string; label: string; accent?: 'primary' | 'navbar' } | null = {
  value: '+26%',
  label: 'Describe the highlighted trend or change over time here.',
  accent: 'navbar' as const,
};

/* ================================================================
   CHART DATA
   Each series is one line. Define `label` + `data` here.
   Colors are assigned automatically from the global palette
   in the order listed.
   ================================================================ */

export const seriesData = [
  {
    label: 'Series A',
    data: [
      { x: '2018', y: 62 },
      { x: '2019', y: 65 },
      { x: '2020', y: 59 },
      { x: '2021', y: 71 },
      { x: '2022', y: 74 },
      { x: '2023', y: 78 },
    ],
  },
  {
    label: 'Series B',
    data: [
      { x: '2018', y: 45 },
      { x: '2019', y: 48 },
      { x: '2020', y: 44 },
      { x: '2021', y: 52 },
      { x: '2022', y: 55 },
      { x: '2023', y: 60 },
    ],
  },
];

/* ================================================================
   CHART OPTIONS
   Adjust height and axis / tooltip formatting.
   ================================================================ */

export const chartOptions = {
  height: 380,
  formatTick: (v: number) => `${v}%`,
  formatValue: (v: number) => `${v}%`,
};

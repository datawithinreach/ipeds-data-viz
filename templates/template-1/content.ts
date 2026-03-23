import type { ArticleMeta as ArticleMetaType } from '@/components/article';
import type { BarDatum } from '@/components/visualizations';

type ChartDatum = BarDatum & { group?: string };

// ===============================================================
// ARTICLE METADATA
// Shown in the page header, <title>, and <meta description>.
// ===============================================================

export const ArticleMeta: ArticleMetaType = {
  title: 'Your Article Title',
  description: 'A short summary of what this article covers.',
  date: '03-01-2025',
  source:
    'Source: Replace with your data source attribution (e.g. IPEDS, National Center for Education Statistics).',
  publishedAt: '03-01-2025',
  imageUrl: '/images/landing/story1.png',
  cardDescription: 'A short card teaser for the landing page.',
  tags: ['tag-1', 'tag-2'],
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
      'Replace this paragraph with your analysis. Explain the data, provide context, and guide the reader through the key takeaways visible in the chart below.',
    ],
  },
];

// ===============================================================
// BANNER
// Optional. Set to null to hide the banner.
// ===============================================================

export const banner: { value: string; label: string } | null = {
  value: '84%',
  label: 'Highlight a key statistic from your dataset here.',
};

// ===============================================================
// CHART DATA
// Each item is one bar. `group` is optional. If provided, bars are
// color-coded by group and a legend is shown automatically.
// ===============================================================

export const chartData: ChartDatum[] = [
  { label: 'Category A', value: 84 },
  { label: 'Category B', value: 72 },
  { label: 'Category C', value: 65 },
  { label: 'Category D', value: 58 },
  { label: 'Category E', value: 43 },
  { label: 'Category F', value: 37 },
];

// ===============================================================
// CHART OPTIONS
// Adjust chart orientation, height, bar thickness, and axis formatting.
// ===============================================================

export const chartOptions = {
  orientation: 'horizontal',
  height: 360,
  barSize: 20,
  formatTick: (v: number) => `${v}%`,
};

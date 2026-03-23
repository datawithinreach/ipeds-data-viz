import type { ArticleMeta as ArticleMetaType } from '@/components/article';

// ================================================================
// ARTICLE METADATA
// Shown in the page header, <title>, and <meta description>.
// ================================================================

export const ArticleMeta: ArticleMetaType = {
  title: 'Getting In: The Numbers Behind Elite Admissions',
  description:
    "Acceptance rates at America's top 20 universities — drawn directly from IPEDS 2024 admissions data.",
  publishDate: '03-15-2026',
  source:
    'Source: IPEDS (Integrated Postsecondary Education Data System), National Center for Education Statistics, U.S. Department of Education. Admissions data from ADM2024 survey component for academic year 2024–2025.',
  imageUrl: '/images/landing/story2.png',
  cardDescription: 'acceptance rates at the top 20',
  tags: ['admissions', 'acceptance rates', 'selectivity'],
  href: '/article/admissions-top-20',
};

// ================================================================
// SECTION CONTENT
// Each section has a heading and one or more paragraphs.
// ================================================================

export const sections = [
  {
    heading: 'Acceptance Rates',
    paragraphs: [
      'Every year, millions of students send applications to a handful of schools they dream about attending. For the universities ranked in the 2025 US News top 20, the math is unsparing: the most selective schools admit fewer than 1 in 25 applicants.',
      'Caltech leads all schools with the lowest acceptance rate at just 2.6% — a function of its small class size and intensely STEM-focused applicant pool. Harvard and Stanford both sit at 3.6%, followed by Yale at 3.9% and Columbia at 4.0%. The three public universities present a markedly different picture: UCLA admits 9.0%, UC Berkeley 11.0%, and Michigan 15.6%.',
    ],
  },
];

// ================================================================
// BANNER
// A highlighted statistic displayed prominently above the chart.
// ================================================================

export const banner = {
  value: '2.6%',
  label:
    "Caltech's acceptance rate — the lowest of any top-20 school, admitting just 356 students from 13,856 applications.",
};

// ================================================================
// CHART DATA
// Each item is one bar. `group` is optional. If provided, bars are
// color-coded by group and a legend is shown automatically.
// ================================================================

export const chartData = [
  { label: 'Caltech', value: 2.6, group: 'Private' },
  { label: 'Harvard', value: 3.6, group: 'Private' },
  { label: 'Stanford', value: 3.6, group: 'Private' },
  { label: 'Yale', value: 3.9, group: 'Private' },
  { label: 'Columbia', value: 4.0, group: 'Private' },
  { label: 'MIT', value: 4.5, group: 'Private' },
  { label: 'UChicago', value: 4.5, group: 'Private' },
  { label: 'Princeton', value: 4.6, group: 'Private' },
  { label: 'Brown', value: 5.4, group: 'Private' },
  { label: 'Dartmouth', value: 5.4, group: 'Private' },
  { label: 'UPenn', value: 5.4, group: 'Private' },
  { label: 'Duke', value: 5.7, group: 'Private' },
  { label: 'Vanderbilt', value: 5.9, group: 'Private' },
  { label: 'JHU', value: 6.4, group: 'Private' },
  { label: 'Northwestern', value: 7.7, group: 'Private' },
  { label: 'Rice', value: 8.0, group: 'Private' },
  { label: 'Cornell', value: 8.8, group: 'Private' },
  { label: 'UCLA', value: 9.0, group: 'Public' },
  { label: 'UC Berkeley', value: 11.0, group: 'Public' },
  { label: 'Notre Dame', value: 11.3, group: 'Private' },
  { label: 'CMU', value: 11.7, group: 'Private' },
  { label: 'WashU', value: 12.1, group: 'Private' },
  { label: 'UMich', value: 15.6, group: 'Public' },
];

// ================================================================
// CHART OPTIONS
// Adjust height, bar thickness, and axis formatting.
// ================================================================

export const chartOptions = {
  orientation: 'horizontal' as const,
  height: 720,
  barSize: 22,
  formatTick: (v: number) => `${v}%`,
};

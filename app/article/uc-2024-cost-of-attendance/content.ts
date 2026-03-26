import type { ArticleMeta as ArticleMetaType } from '@/components/article';
import type { BarDatum } from '@/components/visualizations';

type ChartDatum = BarDatum & { group?: string };

// ===============================================================
// ARTICLE METADATA
// Shown in the page header, <title>, and <meta description>.
// ===============================================================

export const ArticleMeta: ArticleMetaType = {
  title: 'UC cost of attendance (2024–25): in-state, on-campus totals',
  description:
    'IPEDS total price for in-state students living on campus across nine University of California campuses for 2024–25.',
  publishDate: '03-25-2026',
  source:
    'Source: IPEDS (NCES), Total price for in-state students living on campus 2024–25 (DRVCOST2024).',
  imageUrl: '/images/landing/story1.png',
  tags: ['ipeds', 'uc', 'college-costs', 'cost-of-attendance'],
  category: 'Data Analysis',
  href: '/article/uc-2024-cost-of-attendance',
};

// ===============================================================
// SECTION CONTENT
// Each section has a heading and one or more paragraphs.
// ===============================================================

export const sections = [
  {
    heading: 'How much does it cost to attend UC in 2024–25?',
    paragraphs: [
      'IPEDS reports the “total price” for students living on campus as a single figure that rolls up tuition and fees, books and supplies, room and board, and other expenses. The chart below compares that total for in-state students across nine University of California campuses for 2024–25.',
      'Across these campuses, total price ranges from $41,878 at UC Irvine to $48,259 at UC Berkeley—a spread of $6,381. Most campuses cluster in the mid-$40k range, with UC Berkeley standing out as the highest total in the dataset.',
    ],
  },
  {
    heading: 'What this does (and doesn’t) represent',
    paragraphs: [
      'These are published “total price” estimates, not individualized bills. They’re best used for campus-to-campus comparisons and for getting a ballpark of expected annual cost under the same living situation (in-state, on-campus).',
    ],
  },
];

// ===============================================================
// BANNER
// Optional. Set to null to hide the banner.
// ===============================================================

export const banner: { value: string; label: string } | null = {
  value: '$48,259',
  label: 'Highest total price in the dataset (UC Berkeley, in-state, on-campus, 2024–25).',
};

// ===============================================================
// CHART DATA
// Each item is one bar. `group` is optional. If provided, bars are
// color-coded by group and a legend is shown automatically.
// ===============================================================

export const chartData: ChartDatum[] = [
  { label: 'UC Berkeley', value: 48259 },
  { label: 'UC Davis', value: 44202 },
  { label: 'UC Irvine', value: 41878 },
  { label: 'UCLA', value: 41990 },
  { label: 'UC Merced', value: 43966 },
  { label: 'UC Riverside', value: 43603 },
  { label: 'UC San Diego', value: 42902 },
  { label: 'UC Santa Barbara', value: 44907 },
  { label: 'UC Santa Cruz', value: 44047 },
];

// ===============================================================
// CHART OPTIONS
// Adjust chart orientation, height, bar thickness, and axis formatting.
// ===============================================================

type ChartOptions = {
  title: string;
  subtitle: string;
  orientation: 'horizontal' | 'vertical';
  height: number;
  barSize: number;
  formatTick: (v: number) => string;
};

export const chartOptions: ChartOptions = {
  title: 'Total price (in-state, on-campus), 2024–25',
  subtitle:
    'IPEDS total price for in-state students living on campus (DRVCOST2024) across nine UC campuses.',
  orientation: 'vertical',
  height: 520,
  barSize: 70,
  formatTick: (v: number) => `$${v.toLocaleString()}`,
};

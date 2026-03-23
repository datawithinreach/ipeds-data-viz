import type { ArticleMeta as ArticleMetaType } from '@/components/article';

// ================================================================
// ARTICLE METADATA
//   Shown in the page header, <title>, and <meta description>.
// ================================================================

export const ArticleMeta: ArticleMetaType = {
  title: "The Real Cost of America's Top 20 Universities",
  description:
    'How financial aid reshapes the price of elite higher education — and why sticker price is the wrong number to look at.',
  date: '03-20-2026',
  source:
    'Source: IPEDS (Integrated Postsecondary Education Data System), National Center for Education Statistics, U.S. Department of Education. Data for academic years 2020–21 through 2023–24.',
  publishedAt: '03-20-2026',
  imageUrl: '/images/landing/story1.png',
  cardDescription: 'where has tuition increased the most?',
  tags: ['financial aid', 'tuition', 'cost of college'],
  href: '/article/financial-aid-top-20',
};

// ================================================================
// SECTION CONTENT
// Each section has a heading and one or more paragraphs.
// ===============================================================

export const sections = [
  {
    heading: 'Four Years of Rising Costs',
    paragraphs: [
      'The listed price of attending a top-ranked university in the United States has never been higher. In 2023–24, the average sticker price at a private top-20 school reached nearly $87,000 — a figure that provokes sticker shock in even the most prepared families.',
      'Between 2020–21 and 2023–24, tuition has risen across the board — but not uniformly. Johns Hopkins saw the steepest four-year increase at 27.2%, while UCLA posted the most modest at just 3.4%. The chart below tracks five representative schools over that period.',
    ],
  },
  {
    heading: 'The Bottom Line',
    paragraphs: [
      "Sticker price is a poor predictor of actual cost at America\u2019s top universities. Schools with the highest listed prices often provide the most generous aid packages, while the apparent bargain of a public university can vanish for out-of-state students.",
      "For families evaluating top schools, the numbers suggest looking beyond the listed price. The net cost after aid \u2014 and each school\u2019s commitment to meeting demonstrated financial need \u2014 may matter far more than the number on the brochure.",
    ],
  },
];

// ================================================================
// BANNER
// A highlighted statistic displayed prominently.
// ================================================================

export const banner = {
  value: '+27.2%',
  label:
    'Johns Hopkins saw the steepest four-year increase, jumping from $67,667 to $86,065.',
  accent: 'navbar' as const,
};

// ================================================================
// CHART DATA
// Each series is one line. Colors are assigned automatically
// from the global palette in the order listed.
// ================================================================

export const seriesData = [
  {
    key: 'Harvard',
    label: 'Harvard',
    data: [
      { x: "'20–21", y: 75891 },
      { x: "'21–22", y: 78028 },
      { x: "'22–23", y: 83538 },
      { x: "'23–24", y: 86705 },
    ],
  },
  {
    key: 'JHU',
    label: 'JHU',
    data: [
      { x: "'20–21", y: 67667 },
      { x: "'21–22", y: 77977 },
      { x: "'22–23", y: 80800 },
      { x: "'23–24", y: 86065 },
    ],
  },
  {
    key: 'Vanderbilt',
    label: 'Vanderbilt',
    data: [
      { x: "'20–21", y: 76044 },
      { x: "'21–22", y: 79538 },
      { x: "'22–23", y: 84412 },
      { x: "'23–24", y: 89590 },
    ],
  },
  {
    key: 'MIT',
    label: 'MIT',
    data: [
      { x: "'20–21", y: 72462 },
      { x: "'21–22", y: 77020 },
      { x: "'22–23", y: 79850 },
      { x: "'23–24", y: 82730 },
    ],
  },
  {
    key: 'UCLA',
    label: 'UCLA',
    data: [
      { x: "'20–21", y: 66541 },
      { x: "'21–22", y: 66051 },
      { x: "'22–23", y: 67052 },
      { x: "'23–24", y: 68808 },
    ],
  },
];

// ================================================================
// CHART OPTIONS
// Adjust height and axis / tooltip formatting.
// ================================================================

export const chartOptions = {
  height: 380,
  formatTick: (v: number) => `$${(v / 1000).toFixed(0)}K`,
  formatValue: (v: number) => `$${v.toLocaleString()}`,
};

import type { ArticleMeta as ArticleMetaType } from '@/components/article';

// ================================================================
// ARTICLE METADATA
//   Shown in the page header, <title>, and <meta description>.
// ================================================================

export const ArticleMeta: ArticleMetaType = {
  title: "The Real Cost of America's Top 20 Universities",
  description:
    'How financial aid reshapes the price of elite higher education — and why sticker price is the wrong number to look at.',
  publishDate: '03-20-2026',
  source:
    'Source: IPEDS (Integrated Postsecondary Education Data System), National Center for Education Statistics, U.S. Department of Education. Data for academic years 2020–21 through 2023–24.',
  imageUrl: '/images/landing/story1.png',
  tags: ['financial aid', 'tuition', 'cost of college'],
  category: 'Financial',
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
      'Between 2020–21 and 2023–24, tuition has risen across the board — but not uniformly. Johns Hopkins saw the steepest four-year increase at 27.2%, while UCLA posted the most modest at just 3.4%. The chart above tracks five representative schools over that period.',
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
    label: 'Brown University',
    data: [
      { x: "'20–21", y: 80448 },
      { x: "'21–22", y: 82570 },
      { x: "'22–23", y: 83686 },
      { x: "'23–24", y: 87648 },
    ],
  },
  {
    label: 'Caltech',
    data: [
      { x: "'20–21", y: 77718 },
      { x: "'21–22", y: 79947 },
      { x: "'22–23", y: 83598 },
      { x: "'23–24", y: 86886 },
    ],
  },
  {
    label: 'Carnegie Mellon',
    data: [
      { x: "'20–21", y: 76760 },
      { x: "'21–22", y: 77474 },
      { x: "'22–23", y: 80230 },
      { x: "'23–24", y: 83697 },
    ],
  },
  {
    label: 'Columbia',
    data: [
      { x: "'20–21", y: 77603 },
      { x: "'21–22", y: 82584 },
      { x: "'22–23", y: 86097 },
      { x: "'23–24", y: 89587 },
    ],
  },
  {
    label: 'Cornell',
    data: [
      { x: "'20–21", y: 78992 },
      { x: "'21–22", y: 80287 },
      { x: "'22–23", y: 83196 },
      { x: "'23–24", y: 88140 },
    ],
  },
  {
    label: 'Dartmouth',
    data: [
      { x: "'20–21", y: 80184 },
      { x: "'21–22", y: 81501 },
      { x: "'22–23", y: 83802 },
      { x: "'23–24", y: 87793 },
    ],
  },
  {
    label: 'Duke',
    data: [
      { x: "'20–21", y: 77069 },
      { x: "'21–22", y: 79860 },
      { x: "'22–23", y: 82749 },
      { x: "'23–24", y: 87072 },
    ],
  },
  {
    label: 'Harvard',
    data: [
      { x: "'20–21", y: 75891 },
      { x: "'21–22", y: 78028 },
      { x: "'22–23", y: 83538 },
      { x: "'23–24", y: 86705 },
    ],
  },
  {
    label: 'Johns Hopkins',
    data: [
      { x: "'20–21", y: 67667 },
      { x: "'21–22", y: 77977 },
      { x: "'22–23", y: 80800 },
      { x: "'23–24", y: 86065 },
    ],
  },
  {
    label: 'MIT',
    data: [
      { x: "'20–21", y: 72462 },
      { x: "'21–22", y: 77020 },
      { x: "'22–23", y: 79850 },
      { x: "'23–24", y: 82730 },
    ],
  },
  {
    label: 'Northwestern',
    data: [
      { x: "'20–21", y: 81283 },
      { x: "'21–22", y: 83838 },
      { x: "'22–23", y: 89394 },
      { x: "'23–24", y: 91290 },
    ],
  },
  {
    label: 'Princeton',
    data: [
      { x: "'20–21", y: 68044 },
      { x: "'21–22", y: 78490 },
      { x: "'22–23", y: 80415 },
      { x: "'23–24", y: 84040 },
    ],
  },
  {
    label: 'Rice',
    data: [
      { x: "'20–21", y: 69557 },
      { x: "'21–22", y: 71745 },
      { x: "'22–23", y: 74110 },
      { x: "'23–24", y: 78278 },
    ],
  },
  {
    label: 'Stanford',
    data: [
      { x: "'20–21", y: 78218 },
      { x: "'21–22", y: 78898 },
      { x: "'22–23", y: 82162 },
      { x: "'23–24", y: 87833 },
    ],
  },
  {
    label: 'UC Berkeley',
    data: [
      { x: "'20–21", y: 41528 },
      { x: "'21–22", y: 41473 },
      { x: "'22–23", y: 43043 },
      { x: "'23–24", y: 45053 },
    ],
  },
  {
    label: 'UCLA',
    data: [
      { x: "'20–21", y: 66541 },
      { x: "'21–22", y: 66051 },
      { x: "'22–23", y: 67052 },
      { x: "'23–24", y: 68808 },
    ],
  },
  {
    label: 'University of Chicago',
    data: [
      { x: "'20–21", y: 81531 },
      { x: "'21–22", y: 84126 },
      { x: "'22–23", y: 86856 },
      { x: "'23–24", y: 90360 },
    ],
  },
  {
    label: 'Michigan',
    data: [
      { x: "'20–21", y: 31484 },
      { x: "'21–22", y: 32272 },
      { x: "'22–23", y: 33556 },
      { x: "'23–24", y: 34782 },
    ],
  },
  {
    label: 'Notre Dame',
    data: [
      { x: "'20–21", y: 76883 },
      { x: "'21–22", y: 78347 },
      { x: "'22–23", y: 80211 },
      { x: "'23–24", y: 83271 },
    ],
  },
  {
    label: 'UPenn',
    data: [
      { x: "'20–21", y: 81110 },
      { x: "'21–22", y: 83298 },
      { x: "'22–23", y: 85738 },
      { x: "'23–24", y: 89028 },
    ],
  },
  {
    label: 'Vanderbilt',
    data: [
      { x: "'20–21", y: 76044 },
      { x: "'21–22", y: 79538 },
      { x: "'22–23", y: 84412 },
      { x: "'23–24", y: 89590 },
    ],
  },
  {
    label: 'Washington U. St. Louis',
    data: [
      { x: "'20–21", y: 79586 },
      { x: "'21–22", y: 81620 },
      { x: "'22–23", y: 83476 },
      { x: "'23–24", y: 88488 },
    ],
  },
  {
    label: 'Yale',
    data: [
      { x: "'20–21", y: 79370 },
      { x: "'21–22", y: 82170 },
      { x: "'22–23", y: 85120 },
      { x: "'23–24", y: 88300 },
    ],
  },
];

// ================================================================
// CHART OPTIONS
// Adjust height and axis / tooltip formatting.
// ================================================================

type ChartOptions = {
  title: string;
  subtitle: string;
  height: number;
  formatTick: (v: number) => string;
  formatValue: (v: number) => string;
};

export const chartOptions: ChartOptions = {
  title: 'Average Net Price Over Time',
  subtitle: 'Annual net cost after financial aid (selected top schools)',
  height: 380,
  formatTick: (v: number) => `$${(v / 1000).toFixed(0)}K`,
  formatValue: (v: number) => `$${v.toLocaleString()}`,
};

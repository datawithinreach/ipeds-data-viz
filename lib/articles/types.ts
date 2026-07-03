import type { Timestamp } from 'firebase-admin/firestore';

export type SurveyCode = 'admissions' | 'tuition' | 'enrollment' | 'completions' | 'graduation';

export type ChartType = 'bar' | 'line' | 'stackedBar' | 'pie' | 'heatmap' | 'slope';

export type ChartSpec = {
  id: string;
  type: ChartType;
  title: string;
  surveyCode: SurveyCode;
  institutions: string[];
  variables: string[];
  // If set, the editor user has overridden the model's chart-type pick.
  typeOverride?: ChartType | null;
  /** When true, hydrate as a year-by-year time series (line chart) instead of cross-school bars. */
  timeSeries?: boolean;
};

export type SectionRole = 'context' | 'comparison' | 'spotlight' | 'analysis' | 'caveat';

export type ArticleSection = {
  id: string;
  role?: SectionRole;
  heading: string;
  markdown: string;
  chart?: ChartSpec | null;
};

export type HeroStat = {
  /** Pretty-printed value, e.g. "3.6%" or "$59,750" */
  value: string;
  /** Short caption, e.g. "Harvard's 2023–24 admit rate" */
  label: string;
  /** Optional one-sentence framing of why this number matters. */
  context?: string;
};

export type ArticleBody = {
  heroStat?: HeroStat | null;
  intro: string;
  sections: ArticleSection[];
  /** Markdown methodology footer auto-included by the generator. */
  methodology?: string;
  /** Validator warnings from generation; cleared once author addresses or dismisses. */
  generationWarnings?: string[];
};

export type GenerationParams = {
  // No longer constrained to one survey: the user picks variables across surveys.
  // We keep `topic` for back-compat in the prompt but `surveys` is the source of truth.
  topic?: string;
  year: '2024';
  institutions: string[];
  // Variable picks, grouped by survey
  selections: { surveyCode: SurveyCode; variables: string[] }[];
  angle: 'overview' | 'comparison' | 'trend' | 'spotlight';
  tone: 'neutral' | 'analytical' | 'narrative';
  length: 'short' | 'medium' | 'long';
  audience: 'general' | 'student' | 'policy';
  customQuestion?: string;
};

export type ArticleStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export type RevisionEntry = {
  at: Timestamp | Date;
  byUid: string;
  summary: string;
};

export type CommunityArticle = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  source: string;
  authorUid: string;
  authorEmail: string;
  status: ArticleStatus;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  approvedAt?: Timestamp;
  approvedByUid?: string;
  rejectionReason?: string;
  revisionHistory?: RevisionEntry[];
  params: GenerationParams;
  body: ArticleBody;
};

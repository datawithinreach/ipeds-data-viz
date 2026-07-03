import type { SurveyCode } from './datasetsClient';

export type VariableGroup = {
  id: string;
  label: string;
  hint?: string;
  featured?: boolean;
  variables: string[];
};

export const VARIABLE_GROUPS: Record<SurveyCode, VariableGroup[]> = {
  admissions: [
    {
      id: 'rates',
      label: 'Selectivity & yield (computed rates)',
      hint: 'Cleanest comparisons. Pick these for selectivity / conversion stories.',
      featured: true,
      variables: ['ADMIT_RATE_PCT', 'YIELD_RATE_PCT', 'ENROLL_FROM_APPL_PCT'],
    },
    {
      id: 'funnel',
      label: 'Application funnel — totals',
      hint: 'Raw counts at each stage. Pair with the rates above for full-funnel charts.',
      featured: true,
      variables: ['APPLCN', 'ADMSSN', 'ENRLT'],
    },
    {
      id: 'sat',
      label: 'SAT scores (admitted students)',
      hint: '25th, 50th, and 75th percentile scores reported by the school.',
      featured: true,
      variables: ['SATVR25', 'SATVR50', 'SATVR75', 'SATMT25', 'SATMT50', 'SATMT75', 'SATNUM', 'SATPCT'],
    },
    {
      id: 'act',
      label: 'ACT scores (admitted students)',
      variables: ['ACTCM25', 'ACTCM50', 'ACTCM75', 'ACTEN25', 'ACTEN50', 'ACTEN75', 'ACTMT25', 'ACTMT50', 'ACTMT75', 'ACTNUM', 'ACTPCT'],
    },
    {
      id: 'funnel-by-gender',
      label: 'Funnel broken down by gender',
      hint: 'Applicants/admits by reported gender. Use for diversity stories.',
      variables: [
        'APPLCNM', 'APPLCNW', 'APPLCNAN', 'APPLCNUN',
        'ADMSSNM', 'ADMSSNW', 'ADMSSNAN', 'ADMSSNUN',
      ],
    },
    {
      id: 'enrollment-detail',
      label: 'First-time enrollment detail',
      hint: 'First-time freshman enrollment by full-time / part-time status and gender.',
      variables: [
        'ENRLM', 'ENRLW', 'ENRLAN', 'ENRLUN',
        'ENRLFT', 'ENRLFTM', 'ENRLFTW', 'ENRLFTAN', 'ENRLFTUN',
        'ENRLPT', 'ENRLPTM', 'ENRLPTW', 'ENRLPTAN', 'ENRLPTUN',
      ],
    },
    {
      id: 'admcon-derived',
      label: 'Admission requirements (derived 0/1)',
      hint: 'Categorical ADMCON codes turned into binary indicators so they can be charted across schools.',
      variables: [
        'TEST_REQUIRED', 'TEST_OPTIONAL',
        'NUM_FACTORS_REQUIRED', 'NUM_FACTORS_CONSIDERED',
        'ADMCON1_REQUIRED', 'ADMCON3_REQUIRED', 'ADMCON5_REQUIRED', 'ADMCON7_REQUIRED',
        'ADMCON11_REQUIRED', 'ADMCON12_REQUIRED',
        'ADMCON1_CONSIDERED', 'ADMCON3_CONSIDERED', 'ADMCON5_CONSIDERED', 'ADMCON7_CONSIDERED',
        'ADMCON11_CONSIDERED', 'ADMCON12_CONSIDERED',
      ],
    },
  ],

  tuition: [
    {
      id: 'undergrad',
      label: 'Undergraduate published price',
      hint: 'In-district / in-state / out-of-state base tuition and required fees.',
      featured: true,
      variables: ['TUITION1', 'TUITION2', 'TUITION3', 'FEE1', 'FEE2', 'FEE3'],
    },
    {
      id: 'grad',
      label: 'Graduate published price',
      hint: 'Tuition and fees for graduate students (in-district / in-state / out-of-state).',
      featured: true,
      variables: ['TUITION5', 'TUITION6', 'TUITION7', 'FEE5', 'FEE6', 'FEE7'],
    },
    {
      id: 'per-credit',
      label: 'Per-credit-hour charges',
      hint: 'Hourly rates where applicable.',
      variables: ['HRCHG1', 'HRCHG2', 'HRCHG3', 'HRCHG5', 'HRCHG6', 'HRCHG7'],
    },
    {
      id: 'total-cost',
      label: 'Total cost of attendance',
      hint: 'IPEDS COA: tuition + fees + room/board + books, by living arrangement.',
      variables: ['CHG1AT0', 'CHG1AT1', 'CHG1AT2', 'CHG1AT3', 'CHG2AT0', 'CHG2AT1', 'CHG2AT2', 'CHG2AT3', 'CHG1TGTD', 'CHG1FGTD'],
    },
    {
      id: 'professional',
      label: 'Professional programs',
      hint: 'Tuition and fees for professional schools (1=MD, 2=other health, 3=law, etc.).',
      variables: [
        'ISPROF1', 'OSPROF1', 'ISPROF2', 'OSPROF2', 'ISPROF3', 'OSPROF3', 'ISPROF4', 'OSPROF4',
        'ISPROF5', 'OSPROF5', 'ISPROF6', 'OSPROF6', 'ISPROF7', 'OSPROF7', 'ISPROF8', 'OSPROF8', 'ISPROF9', 'OSPROF9',
        'ISPFEE1', 'OSPFEE1', 'ISPFEE2', 'OSPFEE2', 'ISPFEE3', 'OSPFEE3', 'ISPFEE4', 'OSPFEE4',
      ],
    },
  ],

  enrollment: [
    {
      id: 'totals',
      label: 'Total enrollment',
      hint: 'Headline counts. EFTOTLT is the most-cited number.',
      featured: true,
      variables: ['EFTOTLT', 'EFTOTLM', 'EFTOTLW'],
    },
    {
      id: 'by-race',
      label: 'By race / ethnicity (totals)',
      hint: 'Totals across genders for each race/ethnicity category.',
      featured: true,
      variables: ['EFASIAT', 'EFBKAAT', 'EFHISPT', 'EFWHITT', 'EFAIANT', 'EFNHPIT', 'EF2MORT', 'EFUNKNT', 'EFNRALT'],
    },
    {
      id: 'by-race-gender',
      label: 'Race × gender breakdown',
      hint: 'For deeper demographic stories. 18 cells (race × M/W).',
      variables: [
        'EFASIAM', 'EFASIAW', 'EFBKAAM', 'EFBKAAW', 'EFHISPM', 'EFHISPW',
        'EFWHITM', 'EFWHITW', 'EFAIANM', 'EFAIANW', 'EFNHPIM', 'EFNHPIW',
        'EF2MORM', 'EF2MORW', 'EFUNKNM', 'EFUNKNW', 'EFNRALM', 'EFNRALW',
      ],
    },
    {
      id: 'gender-other',
      label: 'Gender (non-binary categories)',
      variables: ['EFGNDRUN', 'EFGNDRAN', 'EFGNDRUA', 'EFGNDRKN'],
    },
  ],

  completions: [
    {
      id: 'totals',
      label: 'Bachelor’s degrees awarded',
      hint: 'Headline output — total degrees and program count.',
      featured: true,
      variables: ['CTOTALT', 'CTOTALM', 'CTOTALW', 'NUM_PROGRAMS'],
    },
    {
      id: 'by-race',
      label: 'By race / ethnicity (totals)',
      hint: 'Totals across genders for each race/ethnicity category.',
      featured: true,
      variables: ['CASIAT', 'CBKAAT', 'CHISPT', 'CWHITT', 'CAIANT', 'CNHPIT', 'C2MORT', 'CUNKNT', 'CNRALT'],
    },
    {
      id: 'by-race-gender',
      label: 'Race × gender breakdown',
      variables: [
        'CASIAM', 'CASIAW', 'CBKAAM', 'CBKAAW', 'CHISPM', 'CHISPW',
        'CWHITM', 'CWHITW', 'CAIANM', 'CAIANW', 'CNHPIM', 'CNHPIW',
        'C2MORM', 'C2MORW', 'CUNKNM', 'CUNKNW', 'CNRALM', 'CNRALW',
      ],
    },
  ],

  graduation: [
    {
      id: 'rate',
      label: 'Graduation rate',
      hint: 'The single most useful number — bachelor’s 6-year completion rate.',
      featured: true,
      variables: ['GRADRATE_BACH'],
    },
    {
      id: 'totals',
      label: 'Cohort and completer totals',
      hint: 'Raw cohort sizes and completer counts (across all races/genders).',
      featured: true,
      variables: ['COHORT_GRTOTLT', 'COMP_GRTOTLT', 'COHORT_GRTOTLM', 'COMP_GRTOTLM', 'COHORT_GRTOTLW', 'COMP_GRTOTLW'],
    },
    {
      id: 'cohort-by-race',
      label: 'Cohort sizes by race / ethnicity',
      variables: [
        'COHORT_GRASIAT', 'COHORT_GRBKAAT', 'COHORT_GRHISPT', 'COHORT_GRWHITT',
        'COHORT_GRAIANT', 'COHORT_GRNHPIT', 'COHORT_GR2MORT', 'COHORT_GRUNKNT', 'COHORT_GRNRALT',
      ],
    },
    {
      id: 'completers-by-race',
      label: 'Completers by race / ethnicity',
      variables: [
        'COMP_GRASIAT', 'COMP_GRBKAAT', 'COMP_GRHISPT', 'COMP_GRWHITT',
        'COMP_GRAIANT', 'COMP_GRNHPIT', 'COMP_GR2MORT', 'COMP_GRUNKNT', 'COMP_GRNRALT',
      ],
    },
  ],
};

/** Variables that are filter/metadata columns rather than chartable values. */
const META_PATTERNS: Partial<Record<SurveyCode, RegExp[]>> = {
  graduation: [/^(COHORT_|COMP_)(UNITID|GRTYPE|CHRTSTAT|SECTION|COHORT|LINE)$/],
  enrollment: [/^(EFALEVEL|LINE|SECTION|LSTUDY)$/],
  completions: [/^(CIPCODE|MAJORNUM|AWLEVEL)$/],
};

export function isMetaVariable(survey: SurveyCode, code: string): boolean {
  const patterns = META_PATTERNS[survey];
  if (!patterns) return false;
  return patterns.some((re) => re.test(code));
}

export type GroupedPickerEntry = {
  group: VariableGroup;
  /** Variables actually present in the dataset, in group order. */
  available: { code: string; description: string }[];
};

/**
 * Build the picker layout for one survey: an ordered list of groups with their
 * (resolved, present-in-dataset) variables, plus an "Other" group for any
 * variables that aren't classified.
 */
export function buildPickerLayout(
  survey: SurveyCode,
  variables: Record<string, string>,
  isChartable: (code: string) => boolean,
): GroupedPickerEntry[] {
  const groups = VARIABLE_GROUPS[survey] ?? [];
  const claimed = new Set<string>();
  const out: GroupedPickerEntry[] = [];
  for (const g of groups) {
    const available = g.variables
      .filter((c) => variables[c] !== undefined && isChartable(c) && !isMetaVariable(survey, c))
      .map((c) => ({ code: c, description: variables[c] }));
    if (available.length === 0) continue;
    available.forEach((v) => claimed.add(v.code));
    out.push({ group: g, available });
  }
  // Anything in the dataset that wasn't placed in a group lands in "Other"
  const others = Object.entries(variables)
    .filter(([c]) => !claimed.has(c) && isChartable(c) && !isMetaVariable(survey, c))
    .map(([c, d]) => ({ code: c, description: d }));
  if (others.length > 0) {
    out.push({
      group: {
        id: 'other',
        label: 'Other variables',
        hint: 'Less common fields not covered by the curated groups above.',
        variables: others.map((o) => o.code),
      },
      available: others,
    });
  }
  return out;
}

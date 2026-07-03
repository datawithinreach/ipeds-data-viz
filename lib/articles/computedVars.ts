import type { SurveyCode } from './datasetsClient';

export type ComputedVarDef = {
  code: string;
  label: string;
  compute: (row: Record<string, string>) => number | null;
};

function num(v: string | undefined): number | null {
  if (v === undefined || v === '' || v === '.') return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

function rate(numerator: string | undefined, denominator: string | undefined): number | null {
  const n = num(numerator);
  const d = num(denominator);
  if (n == null || d == null || d <= 0) return null;
  return Math.round((n / d) * 1000) / 10;
}

// IPEDS admission consideration codes:
// 1 = Required, 2 = Recommended, 3 = Neither required nor recommended,
// 4 = Not used, 5 = Considered if submitted
const ADMCON_LABELS: Record<string, string> = {
  ADMCON1: 'Secondary school GPA',
  ADMCON2: 'Secondary school rank',
  ADMCON3: 'Secondary school record',
  ADMCON4: 'College-prep program completion',
  ADMCON5: 'Recommendations',
  ADMCON6: 'Formal demonstration of competencies',
  ADMCON7: 'Admission test scores',
  ADMCON8: 'English Proficiency Test',
  ADMCON9: 'Other test (Wonderlic, WISC, etc.)',
  ADMCON10: 'Work experience',
  ADMCON11: 'Personal statement / essay',
  ADMCON12: 'Legacy status',
};

function admconRequiredVar(code: string, label: string): ComputedVarDef {
  return {
    code: `${code}_REQUIRED`,
    label: `${label} — required (1 if required, 0 otherwise)`,
    compute: (row) => {
      const v = row[code];
      if (v === undefined || v === '' || v === '.') return null;
      return v.trim() === '1' ? 1 : 0;
    },
  };
}

function admconConsideredVar(code: string, label: string): ComputedVarDef {
  return {
    code: `${code}_CONSIDERED`,
    label: `${label} — considered (1 if required, recommended, or considered)`,
    compute: (row) => {
      const v = row[code];
      if (v === undefined || v === '' || v === '.') return null;
      const t = v.trim();
      return t === '1' || t === '2' || t === '5' ? 1 : 0;
    },
  };
}

const ADMCON_DERIVED: ComputedVarDef[] = [
  ...Object.entries(ADMCON_LABELS).flatMap(([code, label]) => [
    admconRequiredVar(code, label),
    admconConsideredVar(code, label),
  ]),
  {
    code: 'NUM_FACTORS_REQUIRED',
    label: 'Number of admission factors required (count of ADMCON1–12 = 1)',
    compute: (row) => {
      let n = 0;
      let any = false;
      for (const code of Object.keys(ADMCON_LABELS)) {
        const v = row[code];
        if (v === undefined || v === '' || v === '.') continue;
        any = true;
        if (v.trim() === '1') n++;
      }
      return any ? n : null;
    },
  },
  {
    code: 'NUM_FACTORS_CONSIDERED',
    label: 'Number of admission factors required, recommended, or considered',
    compute: (row) => {
      let n = 0;
      let any = false;
      for (const code of Object.keys(ADMCON_LABELS)) {
        const v = row[code];
        if (v === undefined || v === '' || v === '.') continue;
        any = true;
        const t = v.trim();
        if (t === '1' || t === '2' || t === '5') n++;
      }
      return any ? n : null;
    },
  },
  {
    code: 'TEST_REQUIRED',
    label: 'Test scores required (1 if SAT/ACT required for admission)',
    compute: (row) => {
      const v = row.ADMCON7;
      if (v === undefined || v === '' || v === '.') return null;
      return v.trim() === '1' ? 1 : 0;
    },
  },
  {
    code: 'TEST_OPTIONAL',
    label: 'Test optional (1 if test scores are considered if submitted but not required)',
    compute: (row) => {
      const v = row.ADMCON7;
      if (v === undefined || v === '' || v === '.') return null;
      return v.trim() === '5' ? 1 : 0;
    },
  },
];

export const COMPUTED_VARS: Partial<Record<SurveyCode, ComputedVarDef[]>> = {
  admissions: [
    {
      code: 'ADMIT_RATE_PCT',
      label: 'Admit rate — % of applicants admitted (ADMSSN ÷ APPLCN)',
      compute: (row) => rate(row.ADMSSN, row.APPLCN),
    },
    {
      code: 'YIELD_RATE_PCT',
      label: 'Yield rate — % of admitted students who enrolled (ENRLT ÷ ADMSSN)',
      compute: (row) => rate(row.ENRLT, row.ADMSSN),
    },
    {
      code: 'ENROLL_FROM_APPL_PCT',
      label: 'End-to-end conversion — % of applicants who enrolled (ENRLT ÷ APPLCN)',
      compute: (row) => rate(row.ENRLT, row.APPLCN),
    },
    ...ADMCON_DERIVED,
  ],
  graduation: [],
};

export function applyComputedVariables<
  T extends { data: Record<string, Record<string, string>>; variables: Record<string, string> },
>(survey: SurveyCode, ds: T): T {
  const defs = COMPUTED_VARS[survey];
  if (!defs || defs.length === 0) return ds;
  const newData: Record<string, Record<string, string>> = {};
  for (const [id, row] of Object.entries(ds.data)) {
    const newRow = { ...row };
    for (const def of defs) {
      const v = def.compute(row);
      if (v != null) newRow[def.code] = String(v);
    }
    newData[id] = newRow;
  }
  const newVars = { ...ds.variables };
  for (const def of defs) newVars[def.code] = def.label;
  return { ...ds, data: newData, variables: newVars };
}

export function listComputedVarMeta(survey: SurveyCode): Record<string, string> {
  const defs = COMPUTED_VARS[survey];
  if (!defs) return {};
  const out: Record<string, string> = {};
  for (const def of defs) out[def.code] = def.label;
  return out;
}

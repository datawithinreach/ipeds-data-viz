// Client-safe metadata about IPEDS surveys. Pure JSON imports (no Node APIs),
// safe to import from "use client" components.
import admissionsVars from '@/data/2024/admissions/adm_variables2024.json';
import tuitionVars from '@/data/2024/tuition/tuition_variables2024.json';
import enrollmentVars from '@/data/2024/enrollment/enrollment_variables2024.json';
import completionsVars from '@/data/2024/completions/completions_variables2024.json';
import graduationVars from '@/data/2024/graduation/graduation_variables2024.json';
import { listComputedVarMeta } from './computedVars';

export type SurveyCode = 'admissions' | 'tuition' | 'enrollment' | 'completions' | 'graduation';

export type SurveyMeta = {
  code: SurveyCode;
  label: string;
  short: string;
  description: string;
  variables: Record<string, string>;
};

export const SURVEYS: Record<SurveyCode, SurveyMeta> = {
  admissions: {
    code: 'admissions',
    label: 'Admissions (ADM 2023-24)',
    short: 'Admissions',
    description: 'Applications, admits, enrollments, SAT/ACT scores, plus computed admit and yield rates.',
    variables: { ...(admissionsVars as Record<string, string>), ...listComputedVarMeta('admissions') },
  },
  tuition: {
    code: 'tuition',
    label: 'Tuition & Fees (IC_AY 2023-24)',
    short: 'Tuition',
    description: 'Published tuition and required fees.',
    variables: tuitionVars as Record<string, string>,
  },
  enrollment: {
    code: 'enrollment',
    label: 'Fall Enrollment (EF_A 2023)',
    short: 'Enrollment',
    description: 'Total enrollment with race/ethnicity and gender breakdowns.',
    variables: enrollmentVars as Record<string, string>,
  },
  completions: {
    code: 'completions',
    label: "Completions (C_A 2022, Bachelor's)",
    short: 'Completions',
    description: "Bachelor's degrees awarded, totaled across all CIP programs.",
    variables: completionsVars as Record<string, string>,
  },
  graduation: {
    code: 'graduation',
    label: 'Graduation Rates (GR 2023)',
    short: 'Graduation',
    description: "Bachelor's 6-year graduation rate (within 150% normal time).",
    variables: graduationVars as Record<string, string>,
  },
};

export const SURVEY_CODES: SurveyCode[] = ['admissions', 'tuition', 'enrollment', 'completions', 'graduation'];

export function getSurvey(code: SurveyCode): SurveyMeta {
  return SURVEYS[code];
}

// Variables that are categorical codes (e.g. 1=Required, 2=Recommended) rather
// than measurable values. Charting them produces tiny meaningless bars (max 5).
// Hide these from variable pickers but keep them in the underlying dataset.
const NON_CHARTABLE: Partial<Record<SurveyCode, RegExp[]>> = {
  admissions: [/^ADMCON\d+$/], // admission consideration flags
};

export function isChartableVariable(survey: SurveyCode, code: string): boolean {
  if (code === 'UNITID') return false;
  const patterns = NON_CHARTABLE[survey];
  if (!patterns) return true;
  return !patterns.some((re) => re.test(code));
}

export function chartableVariableEntries(survey: SurveyCode): [string, string][] {
  const meta = SURVEYS[survey];
  return Object.entries(meta.variables).filter(([code]) => isChartableVariable(survey, code));
}

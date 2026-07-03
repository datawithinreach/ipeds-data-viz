import 'server-only';
import institutionIds from '@/data/institution_ids.json';
import { applyComputedVariables } from './computedVars';

import admissionsData from '@/data/2024/admissions/adm2024.json';
import admissionsVars from '@/data/2024/admissions/adm_variables2024.json';
import tuitionData from '@/data/2024/tuition/tuition2024.json';
import tuitionVars from '@/data/2024/tuition/tuition_variables2024.json';
import enrollmentData from '@/data/2024/enrollment/enrollment2024.json';
import enrollmentVars from '@/data/2024/enrollment/enrollment_variables2024.json';
import completionsData from '@/data/2024/completions/completions2024.json';
import completionsVars from '@/data/2024/completions/completions_variables2024.json';
import graduationData from '@/data/2024/graduation/graduation2024.json';
import graduationVars from '@/data/2024/graduation/graduation_variables2024.json';

export type SurveyCode = 'admissions' | 'tuition' | 'enrollment' | 'completions' | 'graduation';

export type DatasetEntry = {
  code: SurveyCode;
  label: string;
  short: string;
  description: string;
  data: Record<string, Record<string, string>>;
  variables: Record<string, string>;
  defaultVariables: string[];
};

const admissionsAugmented = applyComputedVariables('admissions', {
  data: admissionsData as Record<string, Record<string, string>>,
  variables: admissionsVars as Record<string, string>,
});

export const datasets: Record<SurveyCode, DatasetEntry> = {
  admissions: {
    code: 'admissions',
    label: 'Admissions (ADM 2023-24)',
    short: 'Admissions',
    description: 'Applications, admits, enrollments, SAT/ACT score ranges, and computed admit/yield rates.',
    data: admissionsAugmented.data,
    variables: admissionsAugmented.variables,
    defaultVariables: ['APPLCN', 'ADMSSN', 'ENRLT', 'ADMIT_RATE_PCT', 'YIELD_RATE_PCT'],
  },
  tuition: {
    code: 'tuition',
    label: 'Tuition & Fees (IC_AY 2023-24)',
    short: 'Tuition',
    description: 'Published tuition and required fees by institution and student type.',
    data: tuitionData as Record<string, Record<string, string>>,
    variables: tuitionVars as Record<string, string>,
    defaultVariables: ['TUITION2', 'FEE2', 'TUITION3', 'FEE3'],
  },
  enrollment: {
    code: 'enrollment',
    label: 'Fall Enrollment (EF_A 2023)',
    short: 'Enrollment',
    description: 'Total enrollment with race/ethnicity and gender breakdowns.',
    data: enrollmentData as Record<string, Record<string, string>>,
    variables: enrollmentVars as Record<string, string>,
    defaultVariables: ['EFTOTLT', 'EFTOTLM', 'EFTOTLW', 'EFASIAT', 'EFBKAAT', 'EFHISPT', 'EFWHITT'],
  },
  completions: {
    code: 'completions',
    label: "Completions (C_A 2022, Bachelor's)",
    short: 'Completions',
    description: "Bachelor's degrees awarded, totaled across all CIP programs.",
    data: completionsData as Record<string, Record<string, string>>,
    variables: completionsVars as Record<string, string>,
    defaultVariables: ['CTOTALT', 'CTOTALM', 'CTOTALW', 'NUM_PROGRAMS'],
  },
  graduation: {
    code: 'graduation',
    label: 'Graduation Rates (GR 2023)',
    short: 'Graduation',
    description: "Bachelor's cohort graduation rates (6-year completion within 150% normal time).",
    data: graduationData as Record<string, Record<string, string>>,
    variables: graduationVars as Record<string, string>,
    defaultVariables: ['GRADRATE_BACH', 'COHORT_GRTOTLT', 'COMP_GRTOTLT'],
  },
};

export const SURVEY_CODES: SurveyCode[] = ['admissions', 'tuition', 'enrollment', 'completions', 'graduation'];

export function getDataset(code: SurveyCode): DatasetEntry {
  const ds = datasets[code];
  if (!ds) throw new Error(`Unknown survey code: ${code}`);
  return ds;
}

export function getInstitutionId(name: string): number | undefined {
  return (institutionIds as Record<string, number>)[name];
}

export function lookupValue(code: SurveyCode, unitId: string | number, variable: string): string | undefined {
  const ds = getDataset(code);
  const row = ds.data[String(unitId)];
  return row?.[variable];
}

export type SurveyVariableSummary = {
  surveyCode: SurveyCode;
  surveyLabel: string;
  variables: { code: string; description: string }[];
};

export function summarizeAllVariables(): SurveyVariableSummary[] {
  return SURVEY_CODES.map((code) => {
    const ds = datasets[code];
    return {
      surveyCode: code,
      surveyLabel: ds.label,
      variables: Object.entries(ds.variables).map(([c, d]) => ({ code: c, description: d })),
    };
  });
}

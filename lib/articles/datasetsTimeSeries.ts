import 'server-only';
import type { SurveyCode } from './datasetsClient';
import { applyComputedVariables } from './computedVars';

import admissionsTs from '@/data/2024/admissions/admissions_timeseries.json';
import tuitionTs from '@/data/2024/tuition/tuition_timeseries.json';
import enrollmentTs from '@/data/2024/enrollment/enrollment_timeseries.json';
import completionsTs from '@/data/2024/completions/completions_timeseries.json';
import graduationTs from '@/data/2024/graduation/graduation_timeseries.json';

export type TimeSeriesSurvey = {
  years: string[];
  /** unitId -> year -> varCode -> value */
  data: Record<string, Record<string, Record<string, string>>>;
};

const RAW: Record<SurveyCode, TimeSeriesSurvey> = {
  admissions: admissionsTs as TimeSeriesSurvey,
  tuition: tuitionTs as TimeSeriesSurvey,
  enrollment: enrollmentTs as TimeSeriesSurvey,
  completions: completionsTs as TimeSeriesSurvey,
  graduation: graduationTs as TimeSeriesSurvey,
};

/**
 * Apply COMPUTED_VARS to every (unitId, year) cell, so derived rates and
 * categorical-derived variables exist on the time-series data too.
 */
function augment(survey: SurveyCode, ts: TimeSeriesSurvey): TimeSeriesSurvey {
  const newData: typeof ts.data = {};
  for (const [unitId, years] of Object.entries(ts.data)) {
    newData[unitId] = {};
    for (const [year, row] of Object.entries(years)) {
      const augmented = applyComputedVariables(survey, {
        data: { _: row },
        variables: {},
      });
      newData[unitId][year] = augmented.data._;
    }
  }
  return { years: ts.years, data: newData };
}

export const TIME_SERIES: Record<SurveyCode, TimeSeriesSurvey> = {
  admissions: augment('admissions', RAW.admissions),
  tuition: augment('tuition', RAW.tuition),
  enrollment: augment('enrollment', RAW.enrollment),
  completions: augment('completions', RAW.completions),
  graduation: augment('graduation', RAW.graduation),
};

export function getTimeSeries(survey: SurveyCode): TimeSeriesSurvey {
  return TIME_SERIES[survey];
}

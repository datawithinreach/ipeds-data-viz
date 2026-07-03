import 'server-only';
import { datasets, getInstitutionId } from './datasets';
import { TIME_SERIES } from './datasetsTimeSeries';
import type { ChartSpec, ChartType } from './types';

export type HydratedBarDatum = {
  label: string;
  value: number;
  group?: string;
};

export type CoverageWarning = {
  variable: string;
  variableLabel: string;
  institutions: string[];
};

export type HydratedChartData = {
  type: ChartType;
  title: string;
  data: HydratedBarDatum[];
  /** Variables that had no value for one or more selected institutions. */
  missing: CoverageWarning[];
  /** Institutions not present in the dataset at all. */
  unknownInstitutions: string[];
};

export type TimeSeriesPoint = { x: string; y: number };
export type TimeSeriesLine = { label: string; data: TimeSeriesPoint[] };
export type HydratedTimeSeriesChartData = {
  mode: 'timeSeries';
  title: string;
  series: TimeSeriesLine[];
  years: string[];
  missing: CoverageWarning[];
  unknownInstitutions: string[];
};

function shortenName(name: string): string {
  return name
    .replace(/^The /, '')
    .replace(/^University of /, 'U ')
    .replace(/ University$/, ' U')
    .replace(/ College$/, ' Col')
    .replace(/ Institute of Technology$/, ' Tech');
}

function effectiveType(spec: ChartSpec): ChartType {
  return (spec.typeOverride ?? spec.type) as ChartType;
}

export function hydrateChart(spec: ChartSpec): HydratedChartData {
  const ds = datasets[spec.surveyCode];
  if (!ds) {
    return {
      type: effectiveType(spec),
      title: spec.title,
      data: [],
      missing: [],
      unknownInstitutions: [],
    };
  }
  const rows: HydratedBarDatum[] = [];
  const multiVar = spec.variables.length > 1;
  const missingByVar = new Map<string, string[]>();
  const unknownInstitutions: string[] = [];

  for (const instName of spec.institutions) {
    const unitId = getInstitutionId(instName);
    if (!unitId) {
      unknownInstitutions.push(instName);
      continue;
    }
    const row = ds.data[String(unitId)];
    if (!row) {
      unknownInstitutions.push(instName);
      continue;
    }

    const shortName = shortenName(instName);

    for (const varCode of spec.variables) {
      const raw = row[varCode];
      const isMissing = raw === undefined || raw === '' || raw === '.';
      const val = isMissing ? NaN : parseFloat(raw);
      if (isMissing || isNaN(val)) {
        if (!missingByVar.has(varCode)) missingByVar.set(varCode, []);
        missingByVar.get(varCode)!.push(instName);
        continue;
      }

      const varLabel = ds.variables[varCode] ?? varCode;
      rows.push({
        label: multiVar ? shortName : instName,
        value: val,
        group: multiVar ? varLabel : undefined,
      });
    }
  }

  const missing: CoverageWarning[] = Array.from(missingByVar.entries()).map(([variable, institutions]) => ({
    variable,
    variableLabel: ds.variables[variable] ?? variable,
    institutions,
  }));

  return {
    type: effectiveType(spec),
    title: spec.title,
    data: rows,
    missing,
    unknownInstitutions,
  };
}

export function hydrateChartTimeSeries(spec: ChartSpec): HydratedTimeSeriesChartData {
  const ts = TIME_SERIES[spec.surveyCode];
  const missing: CoverageWarning[] = [];
  const unknownInstitutions: string[] = [];
  if (!ts) {
    return { mode: 'timeSeries', title: spec.title, series: [], years: [], missing, unknownInstitutions };
  }

  const series: TimeSeriesLine[] = [];
  const labelMulti = spec.institutions.length > 1 && spec.variables.length > 1;
  const variableLabel = (code: string) => datasets[spec.surveyCode]?.variables[code] ?? code;

  for (const inst of spec.institutions) {
    const unitId = getInstitutionId(inst);
    if (!unitId) {
      unknownInstitutions.push(inst);
      continue;
    }
    const yearMap = ts.data[String(unitId)];
    if (!yearMap) {
      unknownInstitutions.push(inst);
      continue;
    }
    for (const code of spec.variables) {
      const points: TimeSeriesPoint[] = [];
      for (const year of ts.years) {
        const raw = yearMap[year]?.[code];
        if (raw === undefined || raw === '' || raw === '.') continue;
        const v = parseFloat(raw);
        if (isNaN(v)) continue;
        points.push({ x: year, y: v });
      }
      if (points.length === 0) {
        const slot = missing.find((m) => m.variable === code);
        if (slot) slot.institutions.push(inst);
        else missing.push({ variable: code, variableLabel: variableLabel(code), institutions: [inst] });
        continue;
      }
      const seriesLabel = labelMulti
        ? `${inst} — ${variableLabel(code)}`
        : spec.institutions.length > 1
          ? inst
          : variableLabel(code);
      series.push({ label: seriesLabel, data: points });
    }
  }

  return {
    mode: 'timeSeries',
    title: spec.title,
    series,
    years: ts.years,
    missing,
    unknownInstitutions,
  };
}

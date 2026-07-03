import 'server-only';
import { datasets, getInstitutionId, type SurveyCode } from '@/lib/articles/datasets';
import type { GenerationParams } from '@/lib/articles/types';

export type VariableInsight = {
  surveyCode: SurveyCode;
  code: string;
  label: string;
  /** Raw per-institution values, ordered by value desc. */
  ranking: { institution: string; value: number }[];
  min: { institution: string; value: number };
  max: { institution: string; value: number };
  median: number;
  /** max - min as an absolute spread. */
  spread: number;
  /** spread / median (fractional). High values mean wide variance worth a story. */
  spreadRatio: number;
  /** Institutions tied at the top (within 1% of max). */
  topTied: string[];
  /** Institutions for which the value is missing/blank. */
  missing: string[];
  /** Plain-English notes the writer can lean on. */
  notes: string[];
  /** Pretty-printed values aligned with `ranking`. */
  formatted: { institution: string; value: string }[];
};

export type InstitutionInsight = {
  institution: string;
  /** Variables on which this institution leads (#1 ranking). */
  leadsOn: string[];
  /** Variables on which this institution trails (#last). */
  trailsOn: string[];
};

export type DataInsights = {
  perVariable: VariableInsight[];
  perInstitution: InstitutionInsight[];
  overall: {
    institutionCount: number;
    surveyCount: number;
    /** Survey codes referenced. */
    surveyCodes: SurveyCode[];
    /** The 1-3 variables with the largest spread ratio — best chart material. */
    headlineVariables: { surveyCode: SurveyCode; code: string; label: string; spreadRatio: number }[];
  };
};

function isPercentVar(code: string): boolean {
  return /(_PCT|_RATE|RATE_)/.test(code) || code.endsWith('_PCT') || code === 'GRADRATE_BACH';
}

function formatValue(code: string, val: number): string {
  if (isPercentVar(code)) return `${val.toFixed(1)}%`;
  if (Number.isInteger(val)) return val.toLocaleString();
  return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function computeInsights(params: GenerationParams): DataInsights {
  const perVariable: VariableInsight[] = [];

  for (const sel of params.selections) {
    const ds = datasets[sel.surveyCode];
    if (!ds) continue;
    for (const code of sel.variables) {
      const label = ds.variables[code] ?? code;
      const values: { institution: string; value: number }[] = [];
      const missing: string[] = [];
      for (const inst of params.institutions) {
        const unitId = getInstitutionId(inst);
        const row = unitId ? ds.data[String(unitId)] : undefined;
        const raw = row?.[code];
        if (raw === undefined || raw === '' || raw === '.') {
          missing.push(inst);
          continue;
        }
        const v = parseFloat(raw);
        if (Number.isNaN(v)) {
          missing.push(inst);
          continue;
        }
        values.push({ institution: inst, value: v });
      }
      if (values.length === 0) continue;

      const ranking = [...values].sort((a, b) => b.value - a.value);
      const min = ranking[ranking.length - 1];
      const max = ranking[0];
      const med = median(values.map((v) => v.value));
      const spread = max.value - min.value;
      const spreadRatio = med > 0 ? spread / med : 0;
      const topTied = ranking
        .filter((r) => Math.abs(r.value - max.value) <= Math.max(0.01 * max.value, 0.01))
        .map((r) => r.institution);

      const notes: string[] = [];
      if (max.institution !== min.institution) {
        notes.push(
          `${max.institution} leads at ${formatValue(code, max.value)}; ${min.institution} trails at ${formatValue(code, min.value)} (gap of ${formatValue(code, spread)}).`,
        );
      }
      if (topTied.length > 1) {
        notes.push(`Tied at the top: ${topTied.join(', ')}.`);
      }
      if (spreadRatio > 0.5 && med > 0) {
        notes.push(`Wide variance — top is more than ${(1 + spreadRatio).toFixed(1)}× the bottom.`);
      } else if (spreadRatio < 0.05 && values.length > 2) {
        notes.push(`Tight cluster — values within ~${(spreadRatio * 100).toFixed(1)}% of each other.`);
      }
      if (missing.length > 0) {
        notes.push(`Not reported by: ${missing.join(', ')}.`);
      }

      perVariable.push({
        surveyCode: sel.surveyCode,
        code,
        label,
        ranking,
        min,
        max,
        median: med,
        spread,
        spreadRatio,
        topTied,
        missing,
        notes,
        formatted: ranking.map((r) => ({ institution: r.institution, value: formatValue(code, r.value) })),
      });
    }
  }

  const perInstitution: InstitutionInsight[] = params.institutions.map((inst) => {
    const leadsOn: string[] = [];
    const trailsOn: string[] = [];
    for (const v of perVariable) {
      if (v.ranking.length < 2) continue;
      if (v.ranking[0].institution === inst) leadsOn.push(v.code);
      if (v.ranking[v.ranking.length - 1].institution === inst) trailsOn.push(v.code);
    }
    return { institution: inst, leadsOn, trailsOn };
  });

  const headlineVariables = [...perVariable]
    .filter((v) => v.ranking.length >= 2 && v.spreadRatio > 0)
    .sort((a, b) => b.spreadRatio - a.spreadRatio)
    .slice(0, 3)
    .map((v) => ({ surveyCode: v.surveyCode, code: v.code, label: v.label, spreadRatio: v.spreadRatio }));

  return {
    perVariable,
    perInstitution,
    overall: {
      institutionCount: params.institutions.length,
      surveyCount: params.selections.length,
      surveyCodes: params.selections.map((s) => s.surveyCode),
      headlineVariables,
    },
  };
}

/** Render a compact, model-friendly summary of insights. */
export function renderInsightsForPrompt(insights: DataInsights): string {
  const lines: string[] = [];
  lines.push('## Story-angle hints (computed from the data brief)');
  lines.push('');
  if (insights.overall.headlineVariables.length > 0) {
    lines.push('Headline variables (largest variance — strongest chart material):');
    for (const h of insights.overall.headlineVariables) {
      lines.push(`- ${h.code} (${h.label}) [${h.surveyCode}] — spread ratio ${h.spreadRatio.toFixed(2)}`);
    }
    lines.push('');
  }
  lines.push('Per-variable rankings + observations:');
  for (const v of insights.perVariable) {
    lines.push(`### ${v.code} — ${v.label} [${v.surveyCode}]`);
    lines.push(
      `Ranked: ${v.formatted.map((r) => `${r.institution} (${r.value})`).join(', ')}`,
    );
    if (v.notes.length > 0) {
      for (const n of v.notes) lines.push(`- ${n}`);
    }
    lines.push('');
  }
  const leaders = insights.perInstitution.filter((p) => p.leadsOn.length > 0);
  if (leaders.length > 0) {
    lines.push('Per-institution leadership:');
    for (const p of leaders) {
      lines.push(`- ${p.institution} leads on: ${p.leadsOn.join(', ')}`);
    }
  }
  return lines.join('\n');
}

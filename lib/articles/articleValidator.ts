import 'server-only';
import { datasets, getInstitutionId } from './datasets';
import type { ArticleBody, ChartSpec, GenerationParams } from './types';

export type ValidatorInput = {
  params: GenerationParams;
  body: ArticleBody;
  title: string;
  description: string;
  tags: string[];
  expectedSections: number;
};

const RATE_RE = /(_PCT|_RATE_|RATE_PCT)|^GRADRATE_/;

function isRateVar(code: string): boolean {
  return RATE_RE.test(code);
}

function isCountVar(code: string): boolean {
  // Heuristic: anything that's not a rate, percent, or known categorical code.
  return !isRateVar(code) && !/^ADMCON/.test(code);
}

export function validateGeneratedArticle({
  params,
  body,
  title,
  description,
  tags,
  expectedSections,
}: ValidatorInput): string[] {
  const warnings: string[] = [];

  // Title
  if (!title || title.length > 90) warnings.push(`Title length ${title.length}/90 — over limit.`);
  if (/^(comparing|a look at|an overview)/i.test(title)) warnings.push('Title uses a generic opener (e.g. "Comparing…", "A look at…").');

  // Description
  if (!description) warnings.push('Description missing.');
  else if (description.length < 80 || description.length > 200) warnings.push(`Description length ${description.length} — target 110–160 chars.`);
  if (/^this article/i.test(description)) warnings.push('Description starts with "This article" — meta-text instead of summary.');

  // Tags
  if (tags.length < 3) warnings.push(`Only ${tags.length} tags — target 3–6.`);
  if (tags.length > 6) warnings.push(`${tags.length} tags — exceeds maximum of 6.`);
  for (const t of tags) {
    if (['data', 'analysis', 'ipeds'].includes(t)) {
      warnings.push(`Tag "${t}" is too generic — should be removed.`);
    }
  }

  // Section count
  if (body.sections.length !== expectedSections) {
    warnings.push(`Section count is ${body.sections.length} — expected exactly ${expectedSections} for this length.`);
  }

  // Hero stat
  if (!body.heroStat) {
    warnings.push('No hero stat produced — articles should lead with a single framing number.');
  } else {
    if (body.heroStat.value.length > 40) warnings.push('Hero stat value is too long.');
    if (body.heroStat.label.length > 120) warnings.push('Hero stat label is too long.');
  }

  // Methodology
  if (!body.methodology || body.methodology.trim().length < 40) {
    warnings.push('Methodology section is missing or too short.');
  }

  // Chart specs
  for (const sec of body.sections) {
    if (!sec.chart) continue;
    const chartIssues = validateChart(sec.chart, params);
    for (const issue of chartIssues) warnings.push(`Section "${sec.heading}" chart: ${issue}`);
  }

  return warnings;
}

function validateChart(chart: ChartSpec, params: GenerationParams): string[] {
  const issues: string[] = [];
  const ds = datasets[chart.surveyCode];
  if (!ds) {
    issues.push(`Unknown survey "${chart.surveyCode}".`);
    return issues;
  }

  const allowedVarsForSurvey = new Set(
    params.selections.find((s) => s.surveyCode === chart.surveyCode)?.variables ?? [],
  );

  for (const v of chart.variables) {
    if (!ds.variables[v]) issues.push(`Variable "${v}" not in ${chart.surveyCode} dataset.`);
    else if (!allowedVarsForSurvey.has(v)) issues.push(`Variable "${v}" wasn't in the user's selection — model invented it.`);
    if (/^ADMCON/.test(v)) issues.push(`Variable "${v}" is a categorical flag and cannot be charted.`);
  }

  for (const inst of chart.institutions) {
    if (!params.institutions.includes(inst)) {
      issues.push(`Institution "${inst}" wasn't in the user's selection.`);
    }
    if (!getInstitutionId(inst)) issues.push(`Institution "${inst}" not in the IPEDS dataset.`);
  }

  // Rate + count mixing on a non-stacked chart is bad — different magnitudes.
  if (chart.type !== 'stackedBar' && chart.variables.length > 1) {
    const hasRate = chart.variables.some(isRateVar);
    const hasCount = chart.variables.some(isCountVar);
    if (hasRate && hasCount) {
      issues.push('Mixes rate (%) variables with count variables on a non-stacked chart — magnitudes will be unreadable.');
    }
  }

  if (chart.institutions.length === 0) issues.push('No institutions specified.');
  if (chart.variables.length === 0) issues.push('No variables specified.');

  return issues;
}

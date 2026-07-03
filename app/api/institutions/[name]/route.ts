import { NextResponse } from 'next/server';
import institutionIds from '@/data/institution_ids.json';
import { datasets, type SurveyCode } from '@/lib/articles/datasets';

const institutions = institutionIds as Record<string, number>;
const ALL_NAMES = Object.keys(institutions);

function findInstitution(query: string): string | null {
  const q = query.trim();
  if (!q) return null;
  if (q in institutions) return q;
  const lower = q.toLowerCase();
  for (const name of ALL_NAMES) {
    if (name.toLowerCase() === lower) return name;
  }
  return null;
}

function suggestionsFor(query: string, max = 8): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const prefix: string[] = [];
  const substr: string[] = [];
  for (const name of ALL_NAMES) {
    const lower = name.toLowerCase();
    if (lower.startsWith(q)) prefix.push(name);
    else if (lower.includes(q)) substr.push(name);
  }
  return [...prefix, ...substr].slice(0, max);
}

const SURVEY_CODES: SurveyCode[] = ['admissions', 'tuition', 'enrollment', 'completions', 'graduation'];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const decoded = decodeURIComponent(name);
  const matched = findInstitution(decoded);
  if (!matched) {
    return NextResponse.json(
      { error: `No exact match for "${decoded}".`, suggestions: suggestionsFor(decoded, 8) },
      { status: 404 },
    );
  }
  const unitId = String(institutions[matched]);

  const surveys: Partial<Record<SurveyCode, Record<string, string>>> = {};
  const variables: Partial<Record<SurveyCode, Record<string, string>>> = {};
  for (const code of SURVEY_CODES) {
    const ds = datasets[code];
    const row = ds.data[unitId];
    if (row) surveys[code] = row;
    variables[code] = ds.variables;
  }

  return NextResponse.json({ college: matched, unit_id: unitId, surveys, variables });
}

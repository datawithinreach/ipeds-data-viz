import { NextResponse } from 'next/server';
import institutionIds from '@/data/institution_ids.json';
import admissionsData from '@/data/2024/admissions/adm2024.json';
import variableDescriptions from '@/data/2024/admissions/adm_variables2024.json';

const institutions = institutionIds as Record<string, number>;
const admissions = admissionsData as Record<string, Record<string, string>>;
const descriptions = variableDescriptions as Record<string, string>;
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
  // Score: prefer prefix matches over substring matches.
  const prefix: string[] = [];
  const substr: string[] = [];
  for (const name of ALL_NAMES) {
    const lower = name.toLowerCase();
    if (lower.startsWith(q)) prefix.push(name);
    else if (lower.includes(q)) substr.push(name);
  }
  return [...prefix, ...substr].slice(0, max);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ collegeName: string }> },
) {
  const { collegeName } = await params;
  const decoded = decodeURIComponent(collegeName);
  const url = new URL(request.url);
  const onlySuggestions = url.searchParams.get('suggest') === '1';

  if (onlySuggestions) {
    return NextResponse.json({ suggestions: suggestionsFor(decoded, 10) });
  }

  const matched = findInstitution(decoded);
  if (!matched) {
    return NextResponse.json(
      {
        error: `No exact match for "${decoded}".`,
        suggestions: suggestionsFor(decoded, 8),
      },
      { status: 404 },
    );
  }

  const unitId = String(institutions[matched]);
  if (!(unitId in admissions)) {
    return NextResponse.json(
      { error: `No admissions data for "${matched}"` },
      { status: 404 },
    );
  }

  const row = admissions[unitId];
  const result: Record<string, { value: string; description: string }> = {};
  for (const [varName, value] of Object.entries(row)) {
    if (!(varName in descriptions)) continue;
    result[varName] = { value, description: descriptions[varName] };
  }

  return NextResponse.json({
    college: matched,
    unit_id: unitId,
    admissions: result,
  });
}

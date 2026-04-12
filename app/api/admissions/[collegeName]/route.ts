import { NextResponse } from 'next/server';
import institutionIds from '@/data/institution_ids.json';
import admissionsData from '@/data/2024/admissions/adm2024.json';
import variableDescriptions from '@/data/2024/admissions/adm_variables2024.json';

const institutions = institutionIds as Record<string, number>;
const admissions = admissionsData as Record<string, Record<string, string>>;
const descriptions = variableDescriptions as Record<string, string>;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ collegeName: string }> },
) {
  const { collegeName } = await params;
  const decoded = decodeURIComponent(collegeName);
  
  // 404 if the college is not found
  if (!(decoded in institutions)) {
    return NextResponse.json(
      { error: `College '${decoded}' not found` },
      { status: 404 },
    );
  }


  const unitId = String(institutions[decoded]);

  // 404 if the college has no admissions data
  if (!(unitId in admissions)) {
    return NextResponse.json(
      { error: `No admissions data for '${decoded}'` },
      { status: 404 },
    );
  }

  const universityId = admissions[unitId];
  const result: Record<string, { value: string; description: string }> = {};

  for (const [varName, value] of Object.entries(universityId)) {
    if (!(varName in descriptions)) continue;
    result[varName] = {
      value,
      description: descriptions[varName],
    };
  }

  return NextResponse.json({
    college: decoded,
    unit_id: unitId,
    admissions: result,
  });
}

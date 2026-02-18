import { NextResponse } from 'next/server';
import type {
  AdmissionsInstitution,
  AdmissionsCategory,
  AdmissionsResponse,
  ApiResponse,
} from '@/types';

const URBAN_BASE =
  'https://educationdata.urban.org/api/v1/college-university/ipeds';

const YEAR = 2022;

type SchoolDef = { name: string; unitid: number };

const CATEGORY_DEFS: {
  id: string;
  label: string;
  description: string;
  schools: SchoolDef[];
}[] = [
  {
    id: 'ivy-league',
    label: 'Ivy League',
    description: 'Five of the eight Ivy League universities',
    schools: [
      { name: 'Harvard', unitid: 166027 },
      { name: 'Columbia', unitid: 190150 },
      { name: 'Yale', unitid: 130794 },
      { name: 'Brown', unitid: 217156 },
      { name: 'Princeton', unitid: 186131 },
    ],
  },
  {
    id: 'elite-non-ivy',
    label: 'Elite Non-Ivy',
    description: 'Highly selective private universities outside the Ivy League',
    schools: [
      { name: 'Stanford', unitid: 243744 },
      { name: 'MIT', unitid: 166683 },
      { name: 'UChicago', unitid: 144050 },
      { name: 'Duke', unitid: 198419 },
      { name: 'Northwestern', unitid: 147767 },
    ],
  },
  {
    id: 'northeast-private',
    label: 'Northeast Private',
    description: 'Selective private institutions across the Northeast',
    schools: [
      { name: 'Dartmouth', unitid: 182670 },
      { name: 'UPenn', unitid: 215062 },
      { name: 'Cornell', unitid: 190415 },
      { name: 'NYU', unitid: 193900 },
      { name: 'Boston College', unitid: 164924 },
    ],
  },
];

type UrbanRequirementsResult = {
  sat_math_25_pctl: number | null;
  sat_math_75_pctl: number | null;
  sat_crit_read_25_pctl: number | null;
  sat_crit_read_75_pctl: number | null;
  act_composite_25_pctl: number | null;
  act_composite_75_pctl: number | null;
};

type UrbanEnrollmentResult = {
  number_applied: number | null;
  number_admitted: number | null;
  sex: number;
};

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

async function fetchSchool(
  school: SchoolDef,
): Promise<AdmissionsInstitution | null> {
  const [reqData, enrollData] = await Promise.all([
    fetchJson<{ results: UrbanRequirementsResult[] }>(
      `${URBAN_BASE}/admissions-requirements/${YEAR}/?unitid=${school.unitid}`,
    ),
    fetchJson<{ results: UrbanEnrollmentResult[] }>(
      `${URBAN_BASE}/admissions-enrollment/${YEAR}/?unitid=${school.unitid}`,
    ),
  ]);

  const req = reqData?.results?.[0];
  if (
    !req ||
    req.sat_math_25_pctl == null ||
    req.sat_math_75_pctl == null ||
    req.sat_crit_read_25_pctl == null ||
    req.sat_crit_read_75_pctl == null ||
    req.act_composite_25_pctl == null ||
    req.act_composite_75_pctl == null
  ) {
    return null;
  }

  let acceptanceRate = 0;
  const totals = enrollData?.results?.find((r) => r.sex === 99);
  if (
    totals &&
    totals.number_applied &&
    totals.number_admitted &&
    totals.number_applied > 0
  ) {
    acceptanceRate = Math.round(
      (totals.number_admitted / totals.number_applied) * 1000,
    ) / 10;
  }

  return {
    name: school.name,
    unitid: school.unitid,
    satMath25: req.sat_math_25_pctl,
    satMath75: req.sat_math_75_pctl,
    satERW25: req.sat_crit_read_25_pctl,
    satERW75: req.sat_crit_read_75_pctl,
    actComposite25: req.act_composite_25_pctl,
    actComposite75: req.act_composite_75_pctl,
    acceptanceRate,
  };
}

async function fetchCategory(
  catDef: (typeof CATEGORY_DEFS)[number],
): Promise<AdmissionsCategory> {
  const results = await Promise.all(catDef.schools.map(fetchSchool));
  const data = results.filter(
    (r): r is AdmissionsInstitution => r !== null,
  );

  data.sort((a, b) => a.acceptanceRate - b.acceptanceRate);

  return {
    id: catDef.id,
    label: catDef.label,
    description: catDef.description,
    data,
  };
}

// GET /api/admissions
// Optional query: ?category=ivy-league (fetches single category)
// No param: fetches all categories
export async function GET(
  request: Request,
): Promise<NextResponse<ApiResponse<AdmissionsResponse>>> {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('category');

  try {
    let categories: AdmissionsCategory[];

    if (categoryId) {
      const catDef = CATEGORY_DEFS.find((c) => c.id === categoryId);
      if (!catDef) {
        return NextResponse.json(
          { error: `Unknown category: ${categoryId}` },
          { status: 400 },
        );
      }
      categories = [await fetchCategory(catDef)];
    } else {
      categories = await Promise.all(CATEGORY_DEFS.map(fetchCategory));
    }

    return NextResponse.json({ data: { categories } });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to fetch admissions data';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

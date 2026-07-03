import { NextResponse } from 'next/server';
import { hydrateChart, hydrateChartTimeSeries } from '@/lib/articles/hydrateChartData';
import type { ChartSpec } from '@/lib/articles/types';

export async function POST(request: Request) {
  try {
    const spec = (await request.json()) as ChartSpec;
    if (!spec.type || !spec.institutions || !spec.variables || !spec.surveyCode) {
      return NextResponse.json({ error: 'Invalid chart spec' }, { status: 400 });
    }
    const hydrated = spec.timeSeries ? hydrateChartTimeSeries(spec) : hydrateChart(spec);
    return NextResponse.json(hydrated);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Hydration failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

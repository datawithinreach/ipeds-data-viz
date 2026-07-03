import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, isAdminEmail } from '@/lib/auth/admin';
import { getById, updateArticle } from '@/lib/articles/communityArticles';
import { reviseChart } from '@/lib/openai/reviseChart';

const inputSchema = z.object({
  chartId: z.string(),
  instruction: z.string().min(1).max(500),
});

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireAuth(request);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await ctx.params;
  const article = await getById(id);
  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const isAdmin = !!user.email && isAdminEmail(user.email);
  if (!isAdmin && article.authorUid !== user.uid) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { chartId, instruction } = inputSchema.parse(await request.json());
    const sectionWithChart = article.body.sections.find((s) => s.chart && s.chart.id === chartId);
    if (!sectionWithChart || !sectionWithChart.chart) {
      return NextResponse.json({ error: 'Chart not found in article' }, { status: 404 });
    }
    const newChart = await reviseChart({ current: sectionWithChart.chart, instruction });
    const sections = article.body.sections.map((s) =>
      s.chart && s.chart.id === chartId ? { ...s, chart: newChart } : s,
    );
    await updateArticle(id, { body: { ...article.body, sections } });
    return NextResponse.json({ chart: newChart });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Chart revision failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

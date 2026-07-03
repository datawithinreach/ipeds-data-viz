import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, isAdminEmail } from '@/lib/auth/admin';
import { getById, updateArticle } from '@/lib/articles/communityArticles';
import { regenerateSection } from '@/lib/openai/regenerateSection';

const inputSchema = z.object({
  sectionId: z.string(),
  instruction: z.string().max(500).optional(),
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
    const { sectionId, instruction } = inputSchema.parse(await request.json());
    const newSection = await regenerateSection({ article, sectionId, instruction });
    const sections = article.body.sections.map((s) => (s.id === sectionId ? newSection : s));
    await updateArticle(id, { body: { ...article.body, sections } });
    return NextResponse.json({ section: newSection });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Regenerate failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

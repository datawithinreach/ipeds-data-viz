import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/admin';
import { getById, submitForReview } from '@/lib/articles/communityArticles';

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
  if (article.authorUid !== user.uid) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (article.status !== 'draft' && article.status !== 'rejected') {
    return NextResponse.json(
      { error: 'Only drafts (or rejected articles) can be submitted for review.' },
      { status: 409 },
    );
  }
  await submitForReview(id);
  return NextResponse.json({ ok: true });
}

import { NextResponse } from 'next/server';
import { requireAuth, isAdminEmail } from '@/lib/auth/admin';
import { articlePatchSchema } from '@/lib/articles/validationSchemas';
import { getById, updateArticle } from '@/lib/articles/communityArticles';

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await ctx.params;
  const article = await getById(id);
  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const isAdmin = !!user.email && isAdminEmail(user.email);
  if (article.authorUid !== user.uid && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return NextResponse.json(article);
}

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
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
  const isAuthor = article.authorUid === user.uid;
  if (!isAdmin && !isAuthor) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!isAdmin && article.status !== 'draft' && article.status !== 'rejected') {
    return NextResponse.json(
      { error: 'Articles can only be edited while in draft (or rejected, to revise).' },
      { status: 409 },
    );
  }

  try {
    const raw = await request.json();
    const patch = articlePatchSchema.parse(raw);
    // If the article was rejected and the author is editing, flip it back to draft.
    const statusFlip =
      isAuthor && !isAdmin && article.status === 'rejected' ? { status: 'draft' as const } : {};
    await updateArticle(id, { ...patch, ...statusFlip });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

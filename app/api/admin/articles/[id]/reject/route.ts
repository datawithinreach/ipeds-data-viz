import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { getById, setRejected } from '@/lib/articles/communityArticles';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const article = await getById(id);

  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  if (article.status !== 'pending') {
    return NextResponse.json(
      { error: `Article is already ${article.status}` },
      { status: 409 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const reason = typeof body.reason === 'string' ? body.reason : undefined;

  await setRejected(id, reason);

  return NextResponse.json({ status: 'rejected' });
}

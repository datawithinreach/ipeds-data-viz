import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { getById, setApproved } from '@/lib/articles/communityArticles';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  let admin;
  try {
    admin = await requireAdmin();
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

  await setApproved(id, admin.uid);

  return NextResponse.json({ status: 'approved' });
}

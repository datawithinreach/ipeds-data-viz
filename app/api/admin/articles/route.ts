import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { getById, getPending } from '@/lib/articles/communityArticles';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = request.nextUrl.searchParams.get('id');

  if (id) {
    const article = await getById(id);
    if (!article) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(article);
  }

  const pending = await getPending();
  return NextResponse.json(pending);
}

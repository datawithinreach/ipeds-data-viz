import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/admin';
import { getByAuthor } from '@/lib/articles/communityArticles';

export async function GET(request: Request) {
  let user;
  try {
    user = await requireAuth(request);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const list = await getByAuthor(user.uid);
    return NextResponse.json(list);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load articles';
    console.error('[/api/my-articles] getByAuthor failed for', user.uid, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/admin';
import { generationParamsSchema } from '@/lib/articles/validationSchemas';
import { generateArticle } from '@/lib/openai/generateArticle';
import { createDraft, getBySlug } from '@/lib/articles/communityArticles';
import { isReservedSlug } from '@/lib/articles/reservedSlugs';
import { slugify, withRandomSuffix } from '@/lib/articles/slug';

const IPEDS_SOURCE =
  'Source: IPEDS (Integrated Postsecondary Education Data System), National Center for Education Statistics, U.S. Department of Education.';

async function pickAvailableSlug(title: string): Promise<string> {
  const base = slugify(title) || 'untitled-story';
  if (!isReservedSlug(base)) {
    const existing = await getBySlug(base);
    if (!existing) return base;
  }
  for (let i = 0; i < 5; i++) {
    const candidate = withRandomSuffix(base);
    if (isReservedSlug(candidate)) continue;
    const existing = await getBySlug(candidate);
    if (!existing) return candidate;
  }
  return withRandomSuffix(base, 8);
}

export async function POST(request: Request) {
  let user;
  try {
    user = await requireAuth(request);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const raw = await request.json();
    const params = generationParamsSchema.parse(raw);
    const generated = await generateArticle(params);
    const slug = await pickAvailableSlug(generated.title);

    const id = await createDraft({
      slug,
      title: generated.title,
      description: generated.description,
      category: params.selections[0]?.surveyCode ?? 'admissions',
      tags: generated.tags,
      source: IPEDS_SOURCE,
      authorUid: user.uid,
      authorEmail: user.email ?? '',
      params,
      body: { ...generated.body, generationWarnings: generated.warnings },
    });

    return NextResponse.json({ id, slug, warnings: generated.warnings }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Draft creation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

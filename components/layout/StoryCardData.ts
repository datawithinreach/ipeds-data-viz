import 'server-only';
import { articleRegistry } from '@/app/article/registry';
import { formatArticleDate, toSortableTimestamp } from '@/components/article/utils/dateFormat';
import type { ArticleMeta } from '@/components/article';

export type StoryCardType = {
  date: string;
  imageUrl: string;
  title: string;
  description: string;
  subtitle?: string;
  tags: string[];
  href: string;
  isCommunity?: boolean;
};

function createStoryCard(meta: ArticleMeta): StoryCardType {
  return {
    date: formatArticleDate(meta.publishDate),
    title: meta.title,
    subtitle: meta.description,
    imageUrl: meta.imageUrl ?? '/images/landing/story1.png',
    description: meta.description,
    tags: meta.tags ?? [],
    href: meta.href ?? '#',
  };
}

const COMMUNITY_FALLBACK_IMAGES = [
  '/images/landing/story6.png',
  '/images/landing/story7.png',
  '/images/landing/story8.png',
  '/images/landing/story9.png',
];

function pickCommunityImage(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  const idx = Math.abs(hash) % COMMUNITY_FALLBACK_IMAGES.length;
  return COMMUNITY_FALLBACK_IMAGES[idx];
}

export const StoryCardData: StoryCardType[] = [...articleRegistry]
  .sort(
    (a, b) =>
      toSortableTimestamp(b.ArticleMeta.publishDate ?? '') -
      toSortableTimestamp(a.ArticleMeta.publishDate ?? ''),
  )
  .map((entry) => createStoryCard(entry.ArticleMeta));

export async function getCommunityStoryCards(): Promise<StoryCardType[]> {
  try {
    const { getApproved } = await import('@/lib/articles/communityArticles');
    const articles = await getApproved();
    return articles.map((a) => ({
      date: a.createdAt
        ? new Date(a.createdAt.seconds * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : '',
      imageUrl: pickCommunityImage(a.id || a.slug || a.title),
      title: a.title,
      description: a.description,
      subtitle: a.description,
      tags: a.tags,
      href: `/article/${a.slug}`,
      isCommunity: true,
    }));
  } catch {
    return [];
  }
}
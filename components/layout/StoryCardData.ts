import 'server-only';
import { articleRegistry } from '@/app/article/registry';
import { formatArticleDate, toSortableTimestamp } from '@/components/article/dateFormat';
import type { ArticleMeta } from '@/components/article';

export type StoryCardType = {
  date: string;
  imageUrl: string;
  title: string;
  description: string;
  subtitle?: string;
  tags: string[];
  href: string;
};

function createStoryCard(meta: ArticleMeta): StoryCardType {
  return {
    date: formatArticleDate(meta.publishDate),
    title: meta.title,
    subtitle: meta.description,
    imageUrl: meta.imageUrl ?? '/images/landing/story1.png',
    description: meta.cardDescription ?? meta.description,
    tags: meta.tags ?? [],
    href: meta.href ?? '#',
  };
}

export const StoryCardData: StoryCardType[] = [...articleRegistry]
  .sort(
    (a, b) =>
      toSortableTimestamp(b.ArticleMeta.publishDate ?? '') -
      toSortableTimestamp(a.ArticleMeta.publishDate ?? ''),
  )
  .map((entry) => createStoryCard(entry.ArticleMeta));
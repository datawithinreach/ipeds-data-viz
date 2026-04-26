import { StoryCardData } from '@/components/layout/StoryCardData';
import { ArticlesPageClient } from './ArticlesPageClient';
import './page.scss';

export default function ArticlesPage() {
  const allArticles = StoryCardData;

  return <ArticlesPageClient allArticles={allArticles} />;
}

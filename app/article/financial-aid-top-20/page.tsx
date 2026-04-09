import type { Metadata } from 'next';
import type { ArticleMeta as ArticleMetaType } from '@/components/article/types';
import { formatArticleDate } from '@/components/article/utils/dateFormat';
import ArticleContent, * as MdxExports from './article.mdx';
import '@/components/article/article.scss';

const ArticleMeta = (MdxExports as unknown as { ArticleMeta: ArticleMetaType })
  .ArticleMeta;

export function generateMetadata(): Metadata {
  return {
    title: ArticleMeta.title,
    description: ArticleMeta.description,
  };
}

export default function Page() {
  const formattedDate = formatArticleDate(ArticleMeta.publishDate);

  return (
    <article className="article">
      <header className="article__header">
        <p className="article__category">
          {ArticleMeta.category ?? 'Data Analysis'}
        </p>
        <h1 className="article__title">{ArticleMeta.title}</h1>
        <p className="article__description">{ArticleMeta.description}</p>
        <div className="article__meta">
          <time>{formattedDate}</time>
        </div>
      </header>

      <div className="article__body article__mdx">
        <ArticleContent />
      </div>

      <div className="article__source">
        <p>{ArticleMeta.source}</p>
      </div>
    </article>
  );
}

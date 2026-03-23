import type { ReactNode } from 'react';
import type { ArticleConfig } from './types';
import { formatArticleDate } from './dateFormat';
import './article.scss';

type Props = ArticleConfig & { children: ReactNode };

export function ArticleLayout({
  category = 'Data Analysis',
  title,
  description,
  publishDate,
  source,
  children,
}: Props) {
  const formattedDate = formatArticleDate(publishDate);

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />

      <article className="article">
        <header className="article__header">
          <p className="article__category">{category}</p>
          <h1 className="article__title">{title}</h1>
          <p className="article__description">{description}</p>
          <div className="article__meta">
            <time>{formattedDate}</time>
          </div>
        </header>

        {children}

        <div className="article__source">
          <p>{source}</p>
        </div>
      </article>
    </>
  );
}

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getApprovedBySlug } from '@/lib/articles/communityArticles';
import { hydrateChart } from '@/lib/articles/hydrateChartData';
import { CommunityArticleBody } from '@/components/article/CommunityArticleBody';
import { formatArticleDate } from '@/components/article/utils/dateFormat';
import '@/components/article/article.scss';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getApprovedBySlug(slug);
  if (!article) return {};
  return { title: article.title, description: article.description };
}

export default async function CommunityArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getApprovedBySlug(slug);
  if (!article) notFound();

  const sections = article.body.sections.map((s) => ({
    heading: s.heading,
    markdown: s.markdown,
    role: s.role,
    hydratedChart: s.chart ? hydrateChart(s.chart) : undefined,
  }));

  const formattedDate = article.createdAt
    ? formatArticleDate(
        new Date(article.createdAt.seconds * 1000)
          .toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
          })
          .replace(/\//g, '-'),
      )
    : '';

  return (
    <article className="article">
      <header className="article__header">
        <p className="article__category">
          {article.category ?? 'Community'} · Community
        </p>
        <h1 className="article__title">{article.title}</h1>
        <p className="article__description">{article.description}</p>
        <div className="article__meta">
          <time>{formattedDate}</time>
          <span>by {article.authorEmail}</span>
        </div>
      </header>

      <div className="article__mdx">
        <CommunityArticleBody
          intro={article.body.intro}
          sections={sections}
          heroStat={article.body.heroStat}
          methodology={article.body.methodology}
        />
      </div>

      <div className="article__source">
        <p>{article.source}</p>
      </div>
    </article>
  );
}

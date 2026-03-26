'use client';

import { SectionDivider } from '@/components/article';
import { formatArticleDate } from '@/components/article/utils/dateFormat';
import { LineChart, Banner } from '@/components/visualizations';
import type { LineSeries } from '@/components/visualizations';
import { chartPalette } from '@/styles/palette';
import {
  ArticleMeta,
  sections,
  banner,
  seriesData,
  chartOptions,
} from './content';
import '@/components/article/article.scss';

const coloredSeries: LineSeries[] = seriesData.map((s, i) => ({
  key: s.label,
  label: s.label,
  data: s.data,
  color: chartPalette[i % chartPalette.length],
}));

export default function Page() {
  const formattedDate = formatArticleDate(ArticleMeta.publishDate);

  return (
    <>
      <title>{ArticleMeta.title}</title>
      <meta name="description" content={ArticleMeta.description} />

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

        <div className="article__chart article__chart--contained">
          <h3 className="article__chartTitle">{chartOptions.title}</h3>
          <p className="article__chartSubtitle">{chartOptions.subtitle}</p>
          <LineChart
            series={coloredSeries}
            formatValue={chartOptions.formatValue}
            formatTick={chartOptions.formatTick}
            height={chartOptions.height}
            enableSeriesSelection
          />
        </div>

        <section>
          <h2 className="article__heading">{sections[0].heading}</h2>
          <div className="article__body">
            {sections[0].paragraphs.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
          </div>

          <Banner
            value={banner.value}
            label={banner.label}
            accent={banner.accent}
          />
        </section>

        <SectionDivider />

        <section>
          <h2 className="article__heading">{sections[1].heading}</h2>
          <div className="article__body">
            {sections[1].paragraphs.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
          </div>
        </section>

        <div className="article__source">
          <p>{ArticleMeta.source}</p>
        </div>
      </article>
    </>
  );
}

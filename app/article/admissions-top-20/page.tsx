'use client';

import { Legend } from '@/components/article';
import { formatArticleDate } from '@/components/article/dateFormat';
import { BarChart, Banner } from '@/components/visualizations';
import type { BarDatum } from '@/components/visualizations';
import { chartPalette } from '@/styles/palette';
import { ArticleMeta, sections, banner, chartData, chartOptions } from './content';
import '@/components/article/article.scss';

const groups = [
  ...new Set(chartData.map((d) => d.group).filter((group): group is string => Boolean(group))),
];

const legendItems = groups.map((g, i) => ({
  label: g,
  color: chartPalette[i % chartPalette.length],
}));

const coloredData: BarDatum[] = chartData.map((d) => ({
  label: d.label,
  value: d.value,
  color: d.group
    ? chartPalette[groups.indexOf(d.group) % chartPalette.length]
    : undefined,
}));

export default function Page() {
  const formattedDate = formatArticleDate(ArticleMeta.publishDate);

  return (
    <>
      <title>{ArticleMeta.title}</title>
      <meta name="description" content={ArticleMeta.description} />

      <article className="article">
        <header className="article__header">
          <p className="article__category">{ArticleMeta.category ?? 'Data Analysis'}</p>
          <h1 className="article__title">{ArticleMeta.title}</h1>
          <p className="article__description">{ArticleMeta.description}</p>
          <div className="article__meta">
            <time>{formattedDate}</time>
          </div>
        </header>

      {sections.map((section, i) => (
        <section key={i}>
          <h2 className="article__heading">{section.heading}</h2>
          <div className="article__body">
            {section.paragraphs.map((text, j) => (
              <p key={j}>{text}</p>
            ))}
          </div>
        </section>
      ))}

      <Banner value={banner.value} label={banner.label} />

      <div className="article__chart">
        {legendItems.length > 0 && <Legend items={legendItems} />}
        <BarChart
          data={coloredData}
          formatTick={chartOptions.formatTick}
          height={chartOptions.height}
          barSize={chartOptions.barSize}
          orientation={chartOptions.orientation}
          renderTooltip={(d) => (
            <>
              <p style={{ fontWeight: 600 }}>{d.label}</p>
              <p>Value: {d.value}%</p>
            </>
          )}
        />
      </div>

        <div className="article__source">
          <p>{ArticleMeta.source}</p>
        </div>
      </article>
    </>
  );
}

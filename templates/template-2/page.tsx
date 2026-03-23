'use client';

import { ArticleLayout, SectionDivider } from '@/components/article';
import { LineChart, Banner } from '@/components/visualizations';
import type { LineSeries } from '@/components/visualizations';
import { chartPalette } from '@/styles/palette';
import { ArticleMeta, sections, banner, seriesData, chartOptions } from './content';

const coloredSeries: LineSeries[] = seriesData.map((s, i) => ({
  ...s,
  color: chartPalette[i % chartPalette.length],
}));

export default function Page() {
  return (
    <ArticleLayout {...ArticleMeta}>
      <div className="article__chart article__chart--contained">
        <LineChart
          series={coloredSeries}
          formatValue={chartOptions.formatValue}
          formatTick={chartOptions.formatTick}
          height={chartOptions.height}
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
    </ArticleLayout>
  );
}

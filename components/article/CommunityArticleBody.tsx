'use client';

import Markdown from 'react-markdown';
import { BarChart } from '@/components/visualizations';
import { Banner } from '@/components/visualizations';
import type { HydratedChartData } from '@/lib/articles/hydrateChartData';
import type { HeroStat, SectionRole } from '@/lib/articles/types';

type Section = {
  heading: string;
  markdown: string;
  role?: SectionRole;
  hydratedChart?: HydratedChartData;
};

type Props = {
  intro: string;
  sections: Section[];
  heroStat?: HeroStat | null;
  methodology?: string;
};

const ROLE_LABEL: Record<SectionRole, string> = {
  context: 'Context',
  comparison: 'Comparison',
  spotlight: 'Spotlight',
  analysis: 'Analysis',
  caveat: 'Caveat',
};

export function CommunityArticleBody({ intro, sections, heroStat, methodology }: Props) {
  return (
    <>
      {heroStat && (
        <div className="article__heroStat">
          <Banner value={heroStat.value} label={heroStat.label} />
          {heroStat.context && <p className="article__heroStatContext">{heroStat.context}</p>}
        </div>
      )}

      <div className="article__body article__body--lede">
        <Markdown>{intro}</Markdown>
      </div>

      {sections.map((section, i) => (
        <section key={i} className="article__section">
          <div className="article__sectionHeader">
            {section.role && (
              <span className={`article__sectionRole article__sectionRole--${section.role}`}>
                {ROLE_LABEL[section.role]}
              </span>
            )}
            <h2 className="article__heading">{section.heading}</h2>
          </div>
          <div className="article__body">
            <Markdown>{section.markdown}</Markdown>
          </div>
          {section.hydratedChart && (
            <BarChart
              data={section.hydratedChart.data}
              title={section.hydratedChart.title}
              orientation="horizontal"
              contained
            />
          )}
        </section>
      ))}

      {methodology && (
        <section className="article__methodology">
          <h2 className="article__methodologyTitle">Methodology</h2>
          <div className="article__body">
            <Markdown>{methodology}</Markdown>
          </div>
        </section>
      )}
    </>
  );
}

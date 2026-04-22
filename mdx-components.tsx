import type { MDXComponents } from 'mdx/types';
import type { ComponentPropsWithoutRef } from 'react';
import { SectionDivider } from '@/components/article';
import {
  Banner,
  BarChart,
  LineChart,
  ScatterPlot,
  StackedBarChart,
  PieChart,
  Histogram,
} from '@/components/visualizations';

/**
 * Markdown typography (h2–h3, p, lists, links, code) is styled in `article.scss`
 * under `.article__mdx` using mixins from `styles/_variables.scss`.
 *
 * The page shell owns the only `<h1>` (Heading 1). A Markdown `#` is rendered as
 * `<h2>` so in-section titles match the design system Heading 2 and the outline
 * stays one H1 per article (same as `##`).
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    BarChart,
    LineChart,
    ScatterPlot,
    StackedBarChart,
    Banner,
    PieChart,
    Histogram,
    SectionDivider,
    h1: (props: ComponentPropsWithoutRef<'h1'>) => (
      <h2 {...(props as unknown as ComponentPropsWithoutRef<'h2'>)} />
    ),
  };
}

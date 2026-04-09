import type { MDXComponents } from 'mdx/types';
import type { ComponentPropsWithoutRef } from 'react';
import { SectionDivider } from '@/components/article';
import {
  Banner,
  BarChart,
  LineChart,
  StackedBarChart,
} from '@/components/visualizations';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    BarChart,
    LineChart,
    StackedBarChart,
    Banner,
    SectionDivider,
    h2: (props: ComponentPropsWithoutRef<'h2'>) => (
      <h2 className="article__heading" {...props} />
    ),
    h3: (props: ComponentPropsWithoutRef<'h3'>) => (
      <h3 className="article__mdxSubheading" {...props} />
    ),
    p: (props: ComponentPropsWithoutRef<'p'>) => <p {...props} />,
    ul: (props: ComponentPropsWithoutRef<'ul'>) => (
      <ul className="article__mdxList" {...props} />
    ),
    ol: (props: ComponentPropsWithoutRef<'ol'>) => (
      <ol className="article__mdxOrderedList" {...props} />
    ),
    li: (props: ComponentPropsWithoutRef<'li'>) => <li {...props} />,
    strong: (props: ComponentPropsWithoutRef<'strong'>) => (
      <strong {...props} />
    ),
    a: (props: ComponentPropsWithoutRef<'a'>) => (
      <a className="article__mdxLink" {...props} />
    ),
    code: (props: ComponentPropsWithoutRef<'code'>) => (
      <code className="article__mdxCode" {...props} />
    ),
    pre: (props: ComponentPropsWithoutRef<'pre'>) => (
      <pre className="article__mdxPre" {...props} />
    ),
  };
}

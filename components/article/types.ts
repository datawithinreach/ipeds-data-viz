export type ArticleMeta = {
  title: string;
  description: string;
  publishDate: string;
  category: string;
  source: string;
  imageUrl?: string;
  tags: string[];
  href: string;
  /** Shown on the landing featured block (e.g. "By: A. B.") */
  author?: string;
};

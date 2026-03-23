export type ArticleConfig = {
  title: string;
  description: string;
  date: string;
  category?: string;
  source: string;
};

export type ArticleMeta = ArticleConfig & {
  publishedAt?: string;
  imageUrl?: string;
  cardDescription?: string;
  tags: string[];
  href?: string;
};

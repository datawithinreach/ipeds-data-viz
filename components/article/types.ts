export type ArticleConfig = {
  title: string;
  description: string;
  publishDate: string;
  category?: string;
  source: string;
};

export type ArticleMeta = ArticleConfig & {
  imageUrl?: string;
  cardDescription?: string;
  tags: string[];
  href?: string;
};

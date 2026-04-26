'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { StoryCard } from '@/components/layout/StoryCard';
import type { StoryCardType } from '@/components/layout/StoryCardTypes';
import { withBasePath } from '@/lib/basePath';

const TOPICS = [
  { value: 'Admissions', label: 'Admissions' },
  { value: 'cost-of-attendance', label: 'Cost of attendance' },
  { value: 'financial-aid', label: 'Financial aid' },
  { value: 'pell-grant', label: 'Pell grant' },
];

function matchesTopic(article: StoryCardType, topic: string): boolean {
  const t = topic.toLowerCase();
  return (
    article.tags.map((tag) => tag.toLowerCase()).includes(t) ||
    article.category.toLowerCase() === t
  );
}

function matchesQuery(article: StoryCardType, query: string): boolean {
  const haystack = `${article.title} ${article.description}`.toLowerCase();
  return haystack.includes(query.toLowerCase().trim());
}

export function ArticlesPageClient({
  allArticles,
}: {
  allArticles: StoryCardType[];
}) {
  const [topic, setTopic] = useState('');
  const [query, setQuery] = useState('');

  const visibleArticles = useMemo(() => {
    return allArticles
      .filter((a) => !topic || matchesTopic(a, topic))
      .filter((a) => !query || matchesQuery(a, query));
  }, [allArticles, topic, query]);

  return (
    <div className="articlesPage">
      <header className="articlesPage__header">
        <h1 className="articlesPage__title">Articles</h1>

        <div className="articlesPage__toolbar">
          <label className="articlesPage__search">
            <span className="visuallyHidden">Find an article</span>
            <button type="button" className="articlesPage__searchSubmit">
              <Image
                src={withBasePath('/icons/search.png')}
                alt=""
                width={18}
                height={18}
                aria-hidden
              />
            </button>
            <input
              type="search"
              className="articlesPage__searchInput"
              placeholder="Find an article..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>

          <div className="articlesPage__filters">
            <Image
              src={withBasePath('/icons/filter.png')}
              alt=""
              width={20}
              height={20}
              className="articlesPage__filterIcon"
              aria-hidden
            />
            <div className="articlesPage__pillGroup">
              <label className="articlesPage__pill">
                <span className="visuallyHidden">Topic</span>
                <select
                  className="articlesPage__pillSelect"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                >
                  <option value="">All</option>
                  {TOPICS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>
      </header>

      {visibleArticles.length === 0 ? (
        <p className="articlesPage__empty">No matching articles.</p>
      ) : (
        <ul className="articlesPage__grid">
          {visibleArticles.map((article) => (
            <li key={article.href} className="articlesPage__cell">
              <StoryCard {...article} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import Image from 'next/image';
import { StoryCard } from '@/components/layout/StoryCard';
import { StoryCardData } from '@/components/layout/StoryCardData';
import { withBasePath } from '@/lib/basePath';
import './page.scss';

export default function ArticlesPage() {
  const allArticles = StoryCardData;

  return (
    <div className="articlesPage">
      <header className="articlesPage__header">
        <h1 className="articlesPage__title">Articles</h1>

        <div className="articlesPage__toolbar">
          <label className="articlesPage__search">
            <span className="visuallyHidden">Find an article</span>
            <button
              type="button"
              className="articlesPage__searchSubmit"
              disabled
            >
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
              disabled
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
                  disabled
                  defaultValue=""
                >
                  <option value="">Topic</option>
                </select>
              </label>
              <label className="articlesPage__pill">
                <span className="visuallyHidden">Region or theme</span>
                <select
                  className="articlesPage__pillSelect"
                  disabled
                  defaultValue=""
                >
                  <option value="">Region</option>
                </select>
              </label>
              <label className="articlesPage__pill">
                <span className="visuallyHidden">Article length</span>
                <select
                  className="articlesPage__pillSelect"
                  disabled
                  defaultValue=""
                >
                  <option value="">Length</option>
                </select>
              </label>
            </div>
            <button type="button" className="articlesPage__apply" disabled>
              Apply
            </button>
          </div>
        </div>
      </header>

      {allArticles.length === 0 ? (
        <p className="articlesPage__empty">No articles yet.</p>
      ) : (
        <ul className="articlesPage__grid">
          {allArticles.map((article) => (
            <li key={article.href} className="articlesPage__cell">
              <StoryCard {...article} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

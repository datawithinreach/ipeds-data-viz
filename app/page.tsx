import Image from 'next/image';
import { StoryCard } from '@/components/layout/StoryCard';
import { StoryCardData } from '@/components/layout/StoryCardData';
import './page.scss';

export default function LandingPage() {
  return (
    <div className="landing">
      <section className="landing__hero">
        <header className="landing__title">
          INSIDE COLLEGE DATA
        </header>
        <header className="landing__subtitle">
          Understading Higher Education Through Data
        </header>
      </section>
      <section className="landing__toolbar">
        <div className="landing__search">
          <Image src="/icons/search.png" alt="Search" width={24} height={24} />
          <input
            type="text"
            width={50}
            placeholder="Find an article..."
            className="landing__searchInput"
          />
        </div>
        <div className="landing__filters">
          <Image src="/icons/filter.png" alt="Filter" width={24} height={24} />
          <button className="landing__filterBtn">
            Topic
          </button>
          <button className="landing__filterBtn">
            Chart Type
          </button>
          <button className="landing__filterBtn">
            Data Interaction
          </button>
        </div>
      </section>
      <section className="landing__grid">
        {StoryCardData.map((story) => (
          <StoryCard key={story.href} {...story} />
        ))}
      </section>
      <section className="landing__more">
        <button className="landing__moreBtn">
          See More Articles
        </button>
      </section>
    </div>
  );
}

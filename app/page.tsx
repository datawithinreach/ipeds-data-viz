import Link from 'next/link';
import { StoryCard } from '@/components/layout/StoryCard';
import {
  StoryCardData,
  getCommunityStoryCards,
} from '@/components/layout/StoryCardData';
import './page.scss';

export default async function LandingPage() {
  const communityCards = await getCommunityStoryCards();
  const allCards = [...StoryCardData, ...communityCards];

  return (
    <div className="landing">
      <section className="landing__hero">
        <p className="landing__eyebrow">Inside College Data</p>
        <h1 className="landing__title">Higher education, by the numbers.</h1>
        <p className="landing__subtitle">
          Short data stories about US colleges and universities — sourced directly from IPEDS,
          edited by humans, drafted with an AI co-writer.
        </p>
        <div className="landing__heroCtas">
          <Link href="/generate" className="landing__heroBtn landing__heroBtn--primary">
            Generate a story
          </Link>
          <Link href="/about" className="landing__heroBtn">
            How this works
          </Link>
        </div>
      </section>

      <section className="landing__sectionHeader">
        <h2 className="landing__sectionTitle">Latest stories</h2>
        <p className="landing__sectionMeta">
          {allCards.length} {allCards.length === 1 ? 'story' : 'stories'} · sourced from IPEDS{' '}
          {new Date().getFullYear() - 1}–{new Date().getFullYear()}
        </p>
      </section>

      <section className="landing__grid">
        {allCards.map((story) => (
          <StoryCard key={story.href} {...story} />
        ))}
      </section>
    </div>
  );
}

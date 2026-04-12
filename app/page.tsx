import Image from 'next/image';
import Link from 'next/link';
import { StoryCard } from '@/components/layout/StoryCard';
import { StoryCardData } from '@/components/layout/StoryCardData';
import './page.scss';

export default function LandingPage() {
  const [featured, ...recentStories] = StoryCardData;

  if (!featured) {
    return (
      <div className="landing landing--empty">
        <p className="landing__emptyMsg">No articles yet.</p>
      </div>
    );
  }

  return (
    <div className="landing">
      <section className="landing__hero" aria-labelledby="landing-heading">
        <h1 id="landing-heading" className="landing__title">
          Inside college data
        </h1>
        <p className="landing__subtitle">
          Understanding higher education through data
        </p>
      </section>

      {featured ? (
        <section
          id="data-explorer"
          className="landing__featured"
          aria-label="Featured article"
        >
          <Link href={featured.href} className="landing__featuredLink">
            <div className="landing__featuredImageWrap">
              <Image
                src={featured.imageUrl}
                alt=""
                fill
                className="landing__featuredImage"
                sizes="(max-width: 900px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="landing__featuredBody">
              <h2 className="landing__featuredTitle">{featured.title}</h2>
              <p className="landing__featuredDek">{featured.category}</p>
              <p className="landing__featuredExcerpt">{featured.description}</p>
              <p className="landing__featuredAuthor">By: {featured.author}</p>
              <span className="landing__featuredRead">
                <span className="landing__featuredReadLabel">Read</span>
                <Image
                  src="/icons/forwardarrow.png"
                  alt=""
                  width={20}
                  height={20}
                  className="landing__featuredReadIcon"
                  aria-hidden
                />
              </span>
            </div>
          </Link>
        </section>
      ) : null}

      <div className="landing__divider" role="presentation" />

      <section
        id="recent-articles"
        className="landing__recent"
        aria-labelledby={recentStories.length > 0 ? 'recent-heading' : undefined}
      >
        {recentStories.length > 0 ? (
          <>
            <h2 id="recent-heading" className="landing__sectionTitle">
              Recent articles
            </h2>
            <div className="landing__storyGrid">
              {recentStories.map((story) => (
                <StoryCard key={story.href} {...story} />
              ))}
            </div>
          </>
        ) : null}
      </section>

      <section className="landing__more">
        <button type="button" className="landing__moreBtn">
          See More Articles
        </button>
      </section>
    </div>
  );
}

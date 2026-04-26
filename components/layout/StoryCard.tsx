import Image from 'next/image';
import Link from 'next/link';
import { type StoryCardType } from './StoryCardData';
import { withBasePath } from '@/lib/basePath';
import './StoryCard.scss';

export function StoryCard({
  date,
  imageUrl,
  title,
  description,
  href,
}: StoryCardType) {
  return (
    <Link href={href} className="storyCard">
      <div className="storyCard__date">{date}</div>
      <div className="storyCard__imageWrapper">
        <Image
          src={withBasePath(imageUrl)}
          alt={title}
          fill
          className="storyCard__image"
        />
        <div className="storyCard__imageOverlay" aria-hidden="true">
          <div className="storyCard__imageOverlayText">{title}</div>
        </div>
      </div>
      <header className="storyCard__title">{title}</header>
      <p className="storyCard__description">{description}</p>
    </Link>
  );
}

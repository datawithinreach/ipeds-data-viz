import Image from 'next/image';
import { type StoryCardType } from '../StoryCardData';

export function StoryCard({
  date,
  imageUrl,
  title,
  description,
}: StoryCardType) {
  return (
    <div className="flex h-[500px] w-[300px] flex-col text-[16px]">
      <div className="text-right font-medium">{date}</div>
      <div className="relative h-[350px] w-full">
        <Image src={imageUrl} alt={title} fill className="object-cover" />
      </div>
      <header className="line-clamp-2 text-left text-[20px] font-semibold">
        {title}
      </header>
      <p className="line-clamp-2 text-left">{description}</p>
    </div>
  );
}

import Image from 'next/image';
import { StoryCard } from '@/components/layout/StoryCard';
import { StoryCardData } from '@/components/layout/StoryCardData';
import { JSX } from 'react';

export default function LandingPage() {
  return (
    <div className="text-primary mx-32 my-8 flex flex-col gap-10">
      <section className="flex flex-col gap-1">
        <header className="font-(family-name:--font-red-hat-mono) text-[58px] leading-none font-medium">
          INSIDE COLLEGE DATA
        </header>
        <header className="text-[24px] font-medium">
          Understading Higher Education Through Data
        </header>
      </section>
      <section className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/icons/search.png" alt="Search" width={24} height={24} />
          <input
            type="text"
            width={50}
            placeholder="Find an article..."
            className="border-primary text-primary placeholder:text-primary/60 rounded-full border bg-[#EFE7D2]/40 px-3 py-1"
          />
        </div>
        <div className="text-medium flex items-center justify-center gap-4 text-[16px]">
          <Image src="/icons/filter.png" alt="Filter" width={24} height={24} />
          <button className="bg-button w-[180px] rounded-full border py-2">
            Topic
          </button>
          <button className="bg-button w-[180px] rounded-full border py-2">
            Chart Type
          </button>
          <button className="bg-button w-[180px] rounded-full border py-2">
            Data Interaction
          </button>
        </div>
      </section>
      <section className="flex w-full flex-wrap justify-center gap-6">
        <RenderStoryCardList />
      </section>
      <section className="flex justify-center">
        <button className="bg-button-secondary w-[200px] rounded-full border py-2">
          See More Articles
        </button>
      </section>
    </div>
  );
}

function RenderStoryCardList(): JSX.Element {
  return (
    <>
      {StoryCardData.map((story, index) => (
        <StoryCard key={index} {...story} />
      ))}
    </>
  );
}

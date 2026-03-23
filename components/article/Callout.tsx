import type { ReactNode } from 'react';

type Props = {
  title: string;
  children: ReactNode;
};

export function Callout({ title, children }: Props) {
  return (
    <div className="article__callout">
      <p className="article__calloutTitle">{title}</p>
      <div className="article__calloutText">{children}</div>
    </div>
  );
}

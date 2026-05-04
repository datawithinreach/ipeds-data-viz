import { ComponentCard } from './ComponentCard';
import { examples } from './examples';

export function ComponentsList() {
  return (
    <main className="components-page">
      <header className="components-page__hero">
        <h1>Components</h1>
        <p>
          Rendered examples for the shared article components, with the matching
          JSX shown directly below each preview.
        </p>
      </header>
      <div className="components-page__stack">
        {examples.map((example) => (
          <ComponentCard key={example.name} {...example} />
        ))}
      </div>
    </main>
  );
}

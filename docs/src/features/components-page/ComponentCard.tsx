import { type ComponentType, useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { evaluate } from '@mdx-js/mdx';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import { mdxComponents } from './mdxComponents';
import type { ComponentExample, ComponentMap } from './types';

export function ComponentCard({ name, code, propDocs }: ComponentExample) {
  const [editableCode, setEditableCode] = useState(code);
  const [Preview, setPreview] = useState<ComponentType<{
    components?: ComponentMap;
  }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [minHeight, setMinHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (previewRef.current) {
      setMinHeight(previewRef.current.offsetHeight);
    }
  }, [editableCode]);

  useEffect(() => {
    evaluate(editableCode, { Fragment, jsx, jsxs })
      .then(({ default: Comp }) => {
        setPreview(() => Comp as ComponentType<{ components?: ComponentMap }>);
        setError(null);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : String(err))
      );
  }, [editableCode]);

  return (
    <section className="components-page__card">
      <h2>{name}</h2>
      <div className="components-page__main-row">
        <div
          ref={previewRef}
          className="components-page__preview"
          style={minHeight ? { minHeight } : undefined}
        >
          <ErrorBoundary
            resetKeys={[editableCode]}
            fallbackRender={({ error }) => (
              <pre className="components-page__error-box">
                Render error: {error instanceof Error ? error.message : String(error)}
              </pre>
            )}
          >
            {Preview ? (
              <Preview components={mdxComponents} />
            ) : (
              <div className="components-page__loading">Rendering preview...</div>
            )}
          </ErrorBoundary>
        </div>
        <div className="components-page__editor-pane">
          <textarea
            aria-label={`${name} code`}
            className="components-page__code-editor"
            spellCheck={false}
            value={editableCode}
            onChange={(event) => setEditableCode(event.target.value)}
          />
          {error ? (
            <pre className="components-page__error-box">{error}</pre>
          ) : null}
        </div>
      </div>
      <section className="components-page__props-section">
        <h3>Props</h3>
        <div className="components-page__props-grid">
          {propDocs.map((prop) => (
            <article key={prop.name} className="components-page__prop-card">
              <div className="components-page__prop-meta">
                <p className="components-page__prop-name">
                  <code>{prop.name}</code>
                </p>
                <p className="components-page__prop-type">
                  <code>{prop.type}</code>
                </p>
              </div>
              <p className="components-page__prop-description">
                {prop.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

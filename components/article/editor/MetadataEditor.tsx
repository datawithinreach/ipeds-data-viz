'use client';

import { useState } from 'react';

type Props = {
  title: string;
  description: string;
  tags: string[];
  onChange: (patch: { title?: string; description?: string; tags?: string[] }) => void;
};

export function MetadataEditor({ title, description, tags, onChange }: Props) {
  const [tagInput, setTagInput] = useState('');

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (!t || tags.includes(t) || tags.length >= 10) return;
    onChange({ tags: [...tags, t] });
    setTagInput('');
  }

  return (
    <section className="editor__metadata">
      <div className="editor__field">
        <label className="editor__label">Title</label>
        <input
          className="editor__input"
          value={title}
          onChange={(e) => onChange({ title: e.target.value })}
          maxLength={200}
        />
      </div>
      <div className="editor__field">
        <label className="editor__label">Description</label>
        <textarea
          className="editor__textarea"
          value={description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={2}
          maxLength={500}
        />
      </div>
      <div className="editor__field">
        <label className="editor__label">Tags ({tags.length}/10)</label>
        <div className="editor__chips">
          {tags.map((tag) => (
            <span key={tag} className="editor__chip">
              {tag}
              <button
                type="button"
                className="editor__chipRemove"
                onClick={() => onChange({ tags: tags.filter((t) => t !== tag) })}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="editor__inlineRow">
          <input
            className="editor__input"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Add a tag (Enter)…"
          />
          <button type="button" className="editor__optionBtn" onClick={addTag}>
            Add
          </button>
        </div>
      </div>
    </section>
  );
}

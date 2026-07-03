'use client';

import { useState } from 'react';
import Markdown from 'react-markdown';
import type { ArticleSection, ChartSpec, SectionRole } from '@/lib/articles/types';
import { ChartEditor } from './ChartEditor';

const ROLES: SectionRole[] = ['context', 'comparison', 'spotlight', 'analysis', 'caveat'];

type Props = {
  section: ArticleSection;
  onChange: (patch: Partial<ArticleSection>) => void;
  onChartChange: (chart: ChartSpec | null) => void;
  onDelete: () => void;
  onAddAfter: () => void;
  onRegenerate: (instruction: string | undefined) => Promise<void>;
  onReviseChart: (chartId: string, instruction: string) => Promise<void>;
};

function emptyChart(): ChartSpec {
  return {
    id: `chart_${Math.random().toString(36).slice(2, 10)}`,
    type: 'bar',
    title: 'New chart',
    surveyCode: 'admissions',
    institutions: [],
    variables: [],
    typeOverride: null,
  };
}

export function SectionEditor({ section, onChange, onChartChange, onDelete, onAddAfter, onRegenerate, onReviseChart }: Props) {
  const [regenInstruction, setRegenInstruction] = useState('');
  const [busyRegen, setBusyRegen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);

  async function doRegen() {
    setBusyRegen(true);
    setRegenError(null);
    try {
      await onRegenerate(regenInstruction.trim() || undefined);
      setRegenInstruction('');
    } catch (err) {
      setRegenError(err instanceof Error ? err.message : 'Regenerate failed');
    } finally {
      setBusyRegen(false);
    }
  }

  return (
    <section className={`editor__section${busyRegen ? ' editor__section--busy' : ''}`}>
      {busyRegen && (
        <div className="editor__overlay">
          <div className="editor__spinner" />
          <p>Regenerating section…</p>
        </div>
      )}
      <div className="editor__sectionHeader">
        <input
          className="editor__input editor__input--heading"
          value={section.heading}
          onChange={(e) => onChange({ heading: e.target.value })}
          placeholder="Section heading"
        />
        <div className="editor__sectionActions">
          <select
            className="editor__input"
            style={{ width: 'auto' }}
            value={section.role ?? ''}
            onChange={(e) => onChange({ role: (e.target.value || undefined) as SectionRole | undefined })}
            title="Section role"
          >
            <option value="">No role</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <button type="button" className="editor__optionBtn" onClick={() => setShowPreview((v) => !v)}>
            {showPreview ? 'Edit' : 'Preview'}
          </button>
          <button type="button" className="editor__optionBtn editor__optionBtn--danger" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>

      {showPreview ? (
        <div className="editor__previewBody">
          <Markdown>{section.markdown}</Markdown>
        </div>
      ) : (
        <textarea
          className="editor__textarea editor__textarea--body"
          value={section.markdown}
          onChange={(e) => onChange({ markdown: e.target.value })}
          rows={10}
          placeholder="Section body (markdown)…"
        />
      )}

      <div className="editor__regen">
        <label className="editor__label">Ask AI to revise this section</label>
        <div className="editor__inlineRow">
          <input
            className="editor__input"
            placeholder="e.g. tighten this and lead with the graduation rate"
            value={regenInstruction}
            onChange={(e) => setRegenInstruction(e.target.value)}
            disabled={busyRegen}
          />
          <button type="button" className="editor__optionBtn" onClick={doRegen} disabled={busyRegen}>
            {busyRegen && <span className="editor__btnSpinner" />}
            {busyRegen ? 'Working…' : 'Regenerate'}
          </button>
        </div>
        {regenError && <p className="editor__error">{regenError}</p>}
      </div>

      <ChartEditor
        chart={section.chart ?? null}
        onChange={onChartChange}
        onCreate={() => onChartChange(emptyChart())}
        onReviseChart={onReviseChart}
      />

      <div className="editor__addAfter">
        <button type="button" className="editor__optionBtn editor__optionBtn--ghost" onClick={onAddAfter}>
          + Add section after
        </button>
      </div>
    </section>
  );
}

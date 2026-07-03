'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/useAuth';
import type { CommunityArticle, ArticleSection, ChartSpec, HeroStat } from '@/lib/articles/types';
import { SectionEditor } from './SectionEditor';
import { MetadataEditor } from './MetadataEditor';
import './editor.scss';

type Props = {
  article: CommunityArticle;
};

function newSectionStub(): ArticleSection {
  return {
    id: `sec_${Math.random().toString(36).slice(2, 10)}`,
    heading: 'New section',
    markdown: '',
    chart: null,
  };
}

export function ArticleEditor({ article: initial }: Props) {
  const router = useRouter();
  const { user } = useAuth();

  const [article, setArticle] = useState<CommunityArticle>(initial);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [submitBusy, setSubmitBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dirtyRef = useRef(false);

  const authHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (user) {
      try {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      } catch {
        // ignore — session cookie may still authorize the request
      }
    }
    return headers;
  }, [user]);

  const persist = useCallback(
    async (next: CommunityArticle) => {
      setSaving(true);
      setError(null);
      try {
        const headers = await authHeaders();
        const res = await fetch(`/api/articles/${article.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            title: next.title,
            description: next.description,
            tags: next.tags,
            body: next.body,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? 'Save failed');
        }
        setSavedAt(new Date());
        dirtyRef.current = false;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Save failed');
      } finally {
        setSaving(false);
      }
    },
    [article.id, authHeaders],
  );

  // Debounced autosave on changes.
  useEffect(() => {
    if (!dirtyRef.current) return;
    const t = setTimeout(() => {
      persist(article);
    }, 1200);
    return () => clearTimeout(t);
  }, [article, persist]);

  function update(mut: (a: CommunityArticle) => CommunityArticle) {
    setArticle((prev) => {
      const next = mut(prev);
      dirtyRef.current = true;
      return next;
    });
  }

  function updateMetadata(patch: Partial<Pick<CommunityArticle, 'title' | 'description' | 'tags'>>) {
    update((prev) => ({ ...prev, ...patch }));
  }

  function updateIntro(intro: string) {
    update((prev) => ({ ...prev, body: { ...prev.body, intro } }));
  }

  function updateHeroStat(patch: Partial<HeroStat>) {
    update((prev) => {
      const next: HeroStat = {
        value: prev.body.heroStat?.value ?? '',
        label: prev.body.heroStat?.label ?? '',
        context: prev.body.heroStat?.context,
        ...patch,
      };
      return { ...prev, body: { ...prev.body, heroStat: next } };
    });
  }

  function clearHeroStat() {
    update((prev) => ({ ...prev, body: { ...prev.body, heroStat: null } }));
  }

  function updateMethodology(methodology: string) {
    update((prev) => ({ ...prev, body: { ...prev.body, methodology } }));
  }

  function updateSection(sectionId: string, patch: Partial<ArticleSection>) {
    update((prev) => ({
      ...prev,
      body: {
        ...prev.body,
        sections: prev.body.sections.map((s) => (s.id === sectionId ? { ...s, ...patch } : s)),
      },
    }));
  }

  function updateChart(sectionId: string, chart: ChartSpec | null) {
    updateSection(sectionId, { chart });
  }

  function deleteSection(sectionId: string) {
    update((prev) => ({
      ...prev,
      body: {
        ...prev.body,
        sections: prev.body.sections.filter((s) => s.id !== sectionId),
      },
    }));
  }

  function addSectionAfter(sectionId: string) {
    update((prev) => {
      const idx = prev.body.sections.findIndex((s) => s.id === sectionId);
      if (idx === -1) return prev;
      const stub = newSectionStub();
      const sections = [...prev.body.sections];
      sections.splice(idx + 1, 0, stub);
      return { ...prev, body: { ...prev.body, sections } };
    });
  }

  async function regenerateSectionAI(sectionId: string, instruction: string | undefined) {
    setError(null);
    if (dirtyRef.current) await persist(article);
    const headers = await authHeaders();
    const res = await fetch(`/api/articles/${article.id}/regenerate-section`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ sectionId, instruction: instruction || undefined }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Regenerate failed');
    const newSection: ArticleSection = data.section;
    setArticle((prev) => ({
      ...prev,
      body: { ...prev.body, sections: prev.body.sections.map((s) => (s.id === sectionId ? newSection : s)) },
    }));
  }

  async function reviseChartAI(chartId: string, instruction: string) {
    setError(null);
    if (dirtyRef.current) await persist(article);
    const headers = await authHeaders();
    const res = await fetch(`/api/articles/${article.id}/revise-chart`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ chartId, instruction }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Chart revision failed');
    const newChart: ChartSpec = data.chart;
    setArticle((prev) => ({
      ...prev,
      body: {
        ...prev.body,
        sections: prev.body.sections.map((s) => (s.chart && s.chart.id === chartId ? { ...s, chart: newChart } : s)),
      },
    }));
  }

  async function submit() {
    setSubmitBusy(true);
    setError(null);
    try {
      if (dirtyRef.current) await persist(article);
      const headers = await authHeaders();
      const res = await fetch(`/api/articles/${article.id}/submit`, {
        method: 'POST',
        headers,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Submit failed');
      }
      router.push('/my-articles');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed');
    } finally {
      setSubmitBusy(false);
    }
  }

  const statusLabel = useMemo(() => {
    switch (article.status) {
      case 'draft':
        return 'Draft';
      case 'pending':
        return 'In review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return article.status;
    }
  }, [article.status]);

  return (
    <div className="editor">
      <header className="editor__header">
        <div>
          <span className={`editor__status editor__status--${article.status}`}>{statusLabel}</span>
          <h1 className="editor__title">Edit article</h1>
          <p className="editor__hint">
            Changes auto-save while in draft. {saving ? 'Saving…' : savedAt ? `Saved ${savedAt.toLocaleTimeString()}` : ''}
          </p>
          {article.status === 'rejected' && article.rejectionReason && (
            <div className="editor__rejection">
              <strong>Rejected by reviewer:</strong> {article.rejectionReason}
              <br />
              Editing will move this back to draft.
            </div>
          )}
        </div>
        <div className="editor__actions">
          <button
            type="button"
            className="editor__submitBtn"
            onClick={submit}
            disabled={submitBusy || article.status === 'pending'}
          >
            {article.status === 'pending' ? 'In review' : submitBusy ? 'Submitting…' : 'Submit for review'}
          </button>
        </div>
      </header>

      {error && <div className="editor__error">{error}</div>}

      {article.body.generationWarnings && article.body.generationWarnings.length > 0 && (
        <div className="editor__warnings">
          <div className="editor__warningsHeader">
            <strong>Generation warnings ({article.body.generationWarnings.length})</strong>
            <button
              type="button"
              className="editor__optionBtn"
              onClick={() =>
                update((prev) => ({
                  ...prev,
                  body: { ...prev.body, generationWarnings: [] },
                }))
              }
            >
              Dismiss
            </button>
          </div>
          <p className="editor__hint">
            Things the validator flagged in the AI&rsquo;s draft. Address what you can — they&rsquo;re visible to reviewers.
          </p>
          <ul>
            {article.body.generationWarnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <MetadataEditor
        title={article.title}
        description={article.description}
        tags={article.tags}
        onChange={updateMetadata}
      />

      <section className="editor__heroStat">
        <div className="editor__sectionHeader">
          <label className="editor__label">Hero stat</label>
          {article.body.heroStat ? (
            <button type="button" className="editor__optionBtn editor__optionBtn--danger" onClick={clearHeroStat}>
              Remove
            </button>
          ) : (
            <button
              type="button"
              className="editor__optionBtn"
              onClick={() => updateHeroStat({ value: '', label: '', context: '' })}
            >
              + Add hero stat
            </button>
          )}
        </div>
        {article.body.heroStat && (
          <div className="editor__heroStatGrid">
            <div className="editor__field">
              <label className="editor__label">Value</label>
              <input
                className="editor__input"
                placeholder='e.g. "3.6%" or "$59,750"'
                value={article.body.heroStat.value}
                onChange={(e) => updateHeroStat({ value: e.target.value })}
              />
            </div>
            <div className="editor__field">
              <label className="editor__label">Label</label>
              <input
                className="editor__input"
                placeholder="e.g. Harvard's 2023–24 admit rate"
                value={article.body.heroStat.label}
                onChange={(e) => updateHeroStat({ label: e.target.value })}
              />
            </div>
            <div className="editor__field">
              <label className="editor__label">Context (optional)</label>
              <textarea
                className="editor__textarea"
                rows={2}
                placeholder="One sentence on why this number matters."
                value={article.body.heroStat.context ?? ''}
                onChange={(e) => updateHeroStat({ context: e.target.value })}
              />
            </div>
          </div>
        )}
      </section>

      <section className="editor__intro">
        <label className="editor__label">Intro paragraph</label>
        <textarea
          className="editor__textarea"
          value={article.body.intro}
          onChange={(e) => updateIntro(e.target.value)}
          rows={4}
        />
      </section>

      {article.body.sections.map((section) => (
        <SectionEditor
          key={section.id}
          section={section}
          onChange={(patch) => updateSection(section.id, patch)}
          onChartChange={(chart) => updateChart(section.id, chart)}
          onDelete={() => deleteSection(section.id)}
          onAddAfter={() => addSectionAfter(section.id)}
          onRegenerate={(instruction) => regenerateSectionAI(section.id, instruction)}
          onReviseChart={(chartId, instruction) => reviseChartAI(chartId, instruction)}
        />
      ))}

      <section className="editor__methodology">
        <label className="editor__label">Methodology</label>
        <p className="editor__hint">A short footer citing IPEDS sources, computed metrics, and year coverage.</p>
        <textarea
          className="editor__textarea"
          rows={4}
          value={article.body.methodology ?? ''}
          onChange={(e) => updateMethodology(e.target.value)}
          placeholder="e.g. Source: IPEDS ADM2023 final-release file. Admit rate computed as ADMSSN ÷ APPLCN…"
        />
      </section>

      {article.body.sections.length === 0 && (
        <div className="editor__emptySections">
          <p>No sections. Add one to get started.</p>
          <button
            type="button"
            className="editor__optionBtn"
            onClick={() =>
              update((prev) => ({
                ...prev,
                body: { ...prev.body, sections: [newSectionStub()] },
              }))
            }
          >
            Add section
          </button>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import institutionIds from '@/data/institution_ids.json';
import { SURVEY_CODES, SURVEYS, type SurveyCode } from '@/lib/articles/datasetsClient';
import { VariablePicker } from '@/components/article/VariablePicker';
import { LiveChart } from '@/components/article/LiveChart';
import type { ChartSpec, ChartType } from '@/lib/articles/types';

const allInstitutions = Object.keys(institutionIds as Record<string, number>).sort();

type Props = {
  chart: ChartSpec | null;
  onChange: (chart: ChartSpec | null) => void;
  onCreate: () => void;
  onReviseChart: (chartId: string, instruction: string) => Promise<void>;
};

export function ChartEditor({ chart, onChange, onCreate, onReviseChart }: Props) {
  const [aiInstruction, setAiInstruction] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [instSearch, setInstSearch] = useState('');


  if (!chart) {
    return (
      <div className="editor__chartEmpty">
        <button type="button" className="editor__optionBtn" onClick={onCreate}>
          + Add chart to this section
        </button>
      </div>
    );
  }

  function setOverride(t: 'auto' | ChartType) {
    if (!chart) return;
    // Slope chart only makes sense for time series — auto-flip the time-series toggle.
    if (t === 'slope') {
      onChange({ ...chart, typeOverride: t, timeSeries: true });
      return;
    }
    onChange({ ...chart, typeOverride: t === 'auto' ? null : t });
  }

  function changeSurvey(s: SurveyCode) {
    if (!chart) return;
    onChange({ ...chart, surveyCode: s, variables: [] });
  }

  function toggleInstitution(name: string) {
    if (!chart) return;
    const has = chart.institutions.includes(name);
    if (has) {
      onChange({ ...chart, institutions: chart.institutions.filter((i) => i !== name) });
    } else if (chart.institutions.length < 10) {
      onChange({ ...chart, institutions: [...chart.institutions, name] });
    }
  }

  function toggleVariable(code: string) {
    if (!chart) return;
    const has = chart.variables.includes(code);
    if (has) {
      onChange({ ...chart, variables: chart.variables.filter((v) => v !== code) });
    } else if (chart.variables.length < 8) {
      onChange({ ...chart, variables: [...chart.variables, code] });
    }
  }

  async function doAiRevise() {
    if (!chart) return;
    if (!aiInstruction.trim()) return;
    setAiBusy(true);
    setAiError(null);
    try {
      await onReviseChart(chart.id, aiInstruction.trim());
      setAiInstruction('');
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Chart revision failed');
    } finally {
      setAiBusy(false);
    }
  }

  const effectiveType: ChartType = (chart.typeOverride ?? chart.type) as ChartType;
  const instSuggestions = instSearch.trim()
    ? allInstitutions
        .filter((n) => n.toLowerCase().includes(instSearch.toLowerCase()) && !chart.institutions.includes(n))
        .slice(0, 6)
    : [];

  return (
    <div className="editor__chart">
      <div className="editor__chartTopbar">
        <input
          className="editor__input"
          value={chart.title}
          onChange={(e) => onChange({ ...chart, title: e.target.value })}
          placeholder="Chart title"
        />
        <button
          type="button"
          className="editor__optionBtn editor__optionBtn--danger"
          onClick={() => onChange(null)}
        >
          Remove chart
        </button>
      </div>

      <div className="editor__chartPreview">
        <p className="editor__chartPreviewHint">Live preview · updates as you toggle variables, switch chart type, or change survey</p>
        {chart.institutions.length > 0 && chart.variables.length > 0 ? (
          <LiveChart spec={chart} />
        ) : (
          <div className="article__callout">
            <p className="article__calloutText">Pick at least one institution and one variable to render the chart.</p>
          </div>
        )}
        {aiBusy && (
          <div className="editor__overlay">
            <div className="editor__spinner" />
            <p>AI is revising the chart…</p>
          </div>
        )}
      </div>

      <div className="editor__chartControls">
        <div className="editor__field">
          <label className="editor__label">Survey</label>
          <select
            className="editor__input"
            value={chart.surveyCode}
            onChange={(e) => changeSurvey(e.target.value as SurveyCode)}
          >
            {SURVEY_CODES.map((s) => (
              <option key={s} value={s}>
                {SURVEYS[s].label}
              </option>
            ))}
          </select>
        </div>

        <div className="editor__field">
          <label className="editor__label">
            <input
              type="checkbox"
              checked={chart.timeSeries ?? false}
              onChange={(e) => onChange({ ...chart, timeSeries: e.target.checked })}
              style={{ marginRight: 6 }}
            />
            Show change over time (line chart, 2019–2023)
          </label>
          <p className="editor__hint">
            When enabled, the chart plots one line per institution + variable across the years available in this survey.
          </p>
        </div>

        <div className="editor__field" style={chart.timeSeries ? { opacity: 0.4, pointerEvents: 'none' } : undefined}>
          <label className="editor__label">Chart type {chart.typeOverride ? <span className="editor__hint">(overriding AI choice)</span> : <span className="editor__hint">(AI suggested: {chart.type})</span>}</label>
          <div className="editor__optionGrid">
            {(['auto', 'bar', 'line', 'stackedBar', 'pie', 'heatmap', 'slope'] as const).map((t) => {
              const active = (t === 'auto' && !chart.typeOverride) || chart.typeOverride === t;
              const label =
                t === 'auto'
                  ? `Auto (${chart.type})`
                  : t === 'stackedBar'
                    ? 'Stacked Bar'
                    : t === 'heatmap'
                      ? 'Heatmap'
                      : t === 'pie'
                        ? 'Pie'
                        : t === 'slope'
                          ? 'Slope'
                          : t.charAt(0).toUpperCase() + t.slice(1);
              return (
                <button
                  key={t}
                  type="button"
                  className={`editor__optionBtn${active ? ' editor__optionBtn--active' : ''}`}
                  onClick={() => setOverride(t)}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <p className="editor__hint">
            Pie = share of total · Heatmap = institutions × variables grid (great for ADMCON codes) · Slope = year-over-year change (requires &ldquo;Show change over time&rdquo;)
          </p>
          <p className="editor__hint">Effective type: <strong>{effectiveType}</strong></p>
        </div>

        <div className="editor__field">
          <label className="editor__label">Institutions ({chart.institutions.length}/10)</label>
          <div className="editor__chips">
            {chart.institutions.map((n) => (
              <span key={n} className="editor__chip">
                {n}
                <button type="button" className="editor__chipRemove" onClick={() => toggleInstitution(n)}>
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            className="editor__input"
            value={instSearch}
            onChange={(e) => setInstSearch(e.target.value)}
            placeholder="Search to add an institution…"
          />
          {instSuggestions.length > 0 && (
            <div className="editor__suggestions">
              {instSuggestions.map((n) => (
                <button
                  key={n}
                  type="button"
                  className="editor__suggestion"
                  onClick={() => {
                    toggleInstitution(n);
                    setInstSearch('');
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="editor__field">
          <label className="editor__label">Variables ({chart.variables.length}/8)</label>
          <VariablePicker
            survey={chart.surveyCode}
            selected={chart.variables}
            onToggle={toggleVariable}
            maxTotal={8}
          />
        </div>

        <div className="editor__field editor__aiBox">
          <label className="editor__label">Ask AI to revise this chart</label>
          <textarea
            className="editor__textarea"
            value={aiInstruction}
            onChange={(e) => setAiInstruction(e.target.value)}
            rows={2}
            placeholder='e.g. "Make this a line chart and switch to graduation rates" or "Add Stanford and MIT"'
            disabled={aiBusy}
          />
          <div className="editor__inlineRow">
            <button
              type="button"
              className="editor__optionBtn editor__optionBtn--primary"
              onClick={doAiRevise}
              disabled={aiBusy || !aiInstruction.trim()}
            >
              {aiBusy && <span className="editor__btnSpinner" />}
              {aiBusy ? 'Asking AI…' : 'Revise with AI'}
            </button>
          </div>
          {aiError && <p className="editor__error">{aiError}</p>}
        </div>
      </div>
    </div>
  );
}

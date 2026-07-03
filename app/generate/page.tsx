'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuth } from '@/components/auth/useAuth';
import institutionIds from '@/data/institution_ids.json';
import { SURVEY_CODES, SURVEYS, type SurveyCode } from '@/lib/articles/datasetsClient';
import { VariablePicker } from '@/components/article/VariablePicker';
import './page.scss';

const allInstitutions = Object.keys(institutionIds as Record<string, number>).sort();

const ANGLES = ['overview', 'comparison', 'trend', 'spotlight'] as const;
const TONES = ['neutral', 'analytical', 'narrative'] as const;
const LENGTHS = ['short', 'medium', 'long'] as const;
const AUDIENCES = ['general', 'student', 'policy'] as const;

type Selections = Partial<Record<SurveyCode, string[]>>;

type Preset = {
  emoji: string;
  title: string;
  blurb: string;
  institutions: string[];
  selections: Selections;
  angle: (typeof ANGLES)[number];
  tone: (typeof TONES)[number];
  length: (typeof LENGTHS)[number];
  audience: (typeof AUDIENCES)[number];
  customQuestion?: string;
};

const PRESETS: Preset[] = [
  {
    emoji: '🎓',
    title: 'Ivy League selectivity',
    blurb: 'Compare applications, admits, and enrollment across all 8 Ivies.',
    institutions: [
      'Harvard University',
      'Yale University',
      'Princeton University',
      'Columbia University in the City of New York',
      'Brown University',
      'University of Pennsylvania',
      'Cornell University',
      'Dartmouth College',
    ],
    selections: { admissions: ['APPLCN', 'ADMSSN', 'ENRLT', 'ADMIT_RATE_PCT', 'YIELD_RATE_PCT'] },
    angle: 'comparison',
    tone: 'analytical',
    length: 'medium',
    audience: 'student',
    customQuestion: 'Which Ivy League school admits the smallest share of its applicants, and how does enrollment yield compare?',
  },
  {
    emoji: '💰',
    title: 'Public vs private tuition',
    blurb: 'Out-of-state tuition at top publics vs sticker price at top privates.',
    institutions: [
      'University of California-Berkeley',
      'University of California-Los Angeles',
      'University of Michigan-Ann Arbor',
      'University of Virginia-Main Campus',
      'Stanford University',
      'Massachusetts Institute of Technology',
      'Harvard University',
      'Yale University',
    ],
    selections: { tuition: ['TUITION2', 'TUITION3'] },
    angle: 'comparison',
    tone: 'analytical',
    length: 'medium',
    audience: 'general',
    customQuestion: 'How does out-of-state tuition at top public flagships compare to sticker price at elite private universities?',
  },
  {
    emoji: '📈',
    title: 'Who graduates? Flagship publics',
    blurb: '6-year graduation rates at the country’s top public universities.',
    institutions: [
      'University of California-Berkeley',
      'University of California-Los Angeles',
      'University of Michigan-Ann Arbor',
      'University of Virginia-Main Campus',
      'University of North Carolina at Chapel Hill',
      'The University of Texas at Austin',
    ],
    selections: { graduation: ['GRADRATE_BACH', 'COHORT_GRTOTLT', 'COMP_GRTOTLT'] },
    angle: 'spotlight',
    tone: 'narrative',
    length: 'medium',
    audience: 'general',
    customQuestion: 'Which flagship public has the highest 6-year bachelor’s graduation rate, and how big is the gap?',
  },
  {
    emoji: '🌐',
    title: 'Diversity at top STEM schools',
    blurb: 'Race/ethnicity breakdown of fall enrollment at leading STEM universities.',
    institutions: [
      'Massachusetts Institute of Technology',
      'Stanford University',
      'California Institute of Technology',
      'Carnegie Mellon University',
      'Georgia Institute of Technology-Main Campus',
    ],
    selections: { enrollment: ['EFTOTLT', 'EFASIAT', 'EFBKAAT', 'EFHISPT', 'EFWHITT'] },
    angle: 'overview',
    tone: 'analytical',
    length: 'medium',
    audience: 'policy',
    customQuestion: 'How does the racial composition of enrollment compare across leading STEM universities?',
  },
  {
    emoji: '📚',
    title: "Bachelor's degrees awarded",
    blurb: 'How many bachelor’s degrees do top schools graduate, and across how many programs?',
    institutions: [
      'Harvard University',
      'Massachusetts Institute of Technology',
      'Stanford University',
      'University of California-Berkeley',
      'University of Michigan-Ann Arbor',
    ],
    selections: { completions: ['CTOTALT', 'NUM_PROGRAMS', 'CTOTALM', 'CTOTALW'] },
    angle: 'overview',
    tone: 'neutral',
    length: 'short',
    audience: 'general',
  },
];

function GenerateForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [instSearch, setInstSearch] = useState('');
  const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>([]);
  const [activeSurvey, setActiveSurvey] = useState<SurveyCode>('admissions');
  const [selections, setSelections] = useState<Selections>({});
  const [angle, setAngle] = useState<(typeof ANGLES)[number]>('overview');
  const [tone, setTone] = useState<(typeof TONES)[number]>('neutral');
  const [length, setLength] = useState<(typeof LENGTHS)[number]>('medium');
  const [audience, setAudience] = useState<(typeof AUDIENCES)[number]>('general');
  const [customQuestion, setCustomQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestions = useMemo(() => {
    if (!instSearch.trim() || selectedInstitutions.length >= 10) return [];
    const lower = instSearch.toLowerCase();
    return allInstitutions
      .filter((n) => n.toLowerCase().includes(lower) && !selectedInstitutions.includes(n))
      .slice(0, 8);
  }, [instSearch, selectedInstitutions]);

  const totalVariables = Object.values(selections).reduce((acc, arr) => acc + (arr?.length ?? 0), 0);

  function applyPreset(p: Preset) {
    setSelectedInstitutions(p.institutions);
    setSelections(p.selections);
    const firstSurvey = (Object.keys(p.selections)[0] as SurveyCode) ?? 'admissions';
    setActiveSurvey(firstSurvey);
    setAngle(p.angle);
    setTone(p.tone);
    setLength(p.length);
    setAudience(p.audience);
    setCustomQuestion(p.customQuestion ?? '');
    setError(null);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function addInstitution(name: string) {
    if (selectedInstitutions.length >= 10) return;
    setSelectedInstitutions((prev) => [...prev, name]);
    setInstSearch('');
  }

  function removeInstitution(name: string) {
    setSelectedInstitutions((prev) => prev.filter((n) => n !== name));
  }

  function toggleVariable(survey: SurveyCode, code: string) {
    setSelections((prev) => {
      const current = prev[survey] ?? [];
      const has = current.includes(code);
      if (has) {
        return { ...prev, [survey]: current.filter((c) => c !== code) };
      }
      if (totalVariables >= 12) return prev;
      return { ...prev, [survey]: [...current, code] };
    });
  }

  async function handleSubmit() {
    if (selectedInstitutions.length === 0) {
      setError('Select at least one institution.');
      return;
    }
    const selectionPayload = SURVEY_CODES
      .map((s) => ({ surveyCode: s, variables: selections[s] ?? [] }))
      .filter((s) => s.variables.length > 0);
    if (selectionPayload.length === 0) {
      setError('Select at least one data variable from any survey.');
      return;
    }

    setError(null);
    setBusy(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (user) {
        const idToken = await user.getIdToken();
        headers['Authorization'] = `Bearer ${idToken}`;
      }

      const res = await fetch('/api/articles/draft', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          year: '2024',
          institutions: selectedInstitutions,
          selections: selectionPayload,
          angle,
          tone,
          length,
          audience,
          customQuestion: customQuestion.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Generation failed');
      }

      const { id } = await res.json();
      router.push(`/edit/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  const activeMeta = SURVEYS[activeSurvey];

  return (
    <div className="generate">
      <div className="generate__header">
        <h1 className="generate__title">Generate Article</h1>
        <p className="generate__subtitle">
          Pick institutions and data variables across IPEDS surveys. The AI writes a draft you can edit, refine, and submit for review.
        </p>
      </div>

      <div className="generate__howItWorks">
        <strong>How this works:</strong> ① pick a few schools, ② check the data variables you want to compare, ③ choose tone/length, ④ generate a draft. You&rsquo;ll land in an editor where you can edit any section, swap chart types, and ask the AI to revise individual charts in plain English.
      </div>

      <section className="generate__presets">
        <h2 className="generate__presetsTitle">Not sure where to start? Try a template:</h2>
        <div className="generate__presetGrid">
          {PRESETS.map((p) => (
            <button
              key={p.title}
              type="button"
              className="generate__presetCard"
              onClick={() => applyPreset(p)}
            >
              <div className="generate__presetEmoji">{p.emoji}</div>
              <div className="generate__presetTitle">{p.title}</div>
              <div className="generate__presetBlurb">{p.blurb}</div>
              <div className="generate__presetMeta">
                {p.institutions.length} schools ·{' '}
                {Object.entries(p.selections)
                  .map(([s, v]) => `${SURVEYS[s as SurveyCode].short} (${v?.length ?? 0})`)
                  .join(' + ')}
              </div>
            </button>
          ))}
        </div>
        <p className="generate__presetsHint">
          Clicking a template fills the form below — you can still edit anything before generating.
        </p>
      </section>

      {error && <div className="generate__error">{error}</div>}

      <div className="generate__form">
        <div className="generate__field">
          <label className="generate__label">Institutions (1–10)</label>
          <input
            className="generate__searchInput"
            type="text"
            placeholder="Search institutions…"
            value={instSearch}
            onChange={(e) => setInstSearch(e.target.value)}
          />
          {suggestions.length > 0 && (
            <div className="generate__suggestions">
              {suggestions.map((name) => (
                <button
                  key={name}
                  className="generate__suggestion"
                  type="button"
                  onClick={() => addInstitution(name)}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
          {selectedInstitutions.length > 0 && (
            <div className="generate__chips">
              {selectedInstitutions.map((name) => (
                <span key={name} className="generate__chip">
                  {name}
                  <button
                    className="generate__chipRemove"
                    type="button"
                    onClick={() => removeInstitution(name)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="generate__field">
          <label className="generate__label">
            Data Variables <span className="generate__hint">(pick across surveys; up to 12 total — selected: {totalVariables})</span>
          </label>
          <div className="generate__optionGrid" style={{ marginBottom: '0.75rem' }}>
            {SURVEY_CODES.map((s) => {
              const count = selections[s]?.length ?? 0;
              return (
                <button
                  key={s}
                  type="button"
                  className={`generate__optionBtn${activeSurvey === s ? ' generate__optionBtn--active' : ''}`}
                  onClick={() => setActiveSurvey(s)}
                >
                  {SURVEYS[s].short}
                  {count > 0 && <span className="generate__chip" style={{ marginLeft: 6, padding: '0 6px' }}>{count}</span>}
                </button>
              );
            })}
          </div>
          <p className="generate__hint">{activeMeta.description}</p>
          <VariablePicker
            survey={activeSurvey}
            selected={selections[activeSurvey] ?? []}
            onToggle={(code) => toggleVariable(activeSurvey, code)}
            maxTotal={12}
            selectedTotal={totalVariables}
            emptyHint="Try the Featured groups for the most common picks."
          />
        </div>

        <div className="generate__field">
          <label className="generate__label">Angle</label>
          <div className="generate__optionGrid">
            {ANGLES.map((a) => (
              <button
                key={a}
                type="button"
                className={`generate__optionBtn${angle === a ? ' generate__optionBtn--active' : ''}`}
                onClick={() => setAngle(a)}
              >
                {a.charAt(0).toUpperCase() + a.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="generate__field">
          <label className="generate__label">Tone</label>
          <div className="generate__optionGrid">
            {TONES.map((t) => (
              <button
                key={t}
                type="button"
                className={`generate__optionBtn${tone === t ? ' generate__optionBtn--active' : ''}`}
                onClick={() => setTone(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="generate__field">
          <label className="generate__label">Length</label>
          <div className="generate__optionGrid">
            {LENGTHS.map((l) => (
              <button
                key={l}
                type="button"
                className={`generate__optionBtn${length === l ? ' generate__optionBtn--active' : ''}`}
                onClick={() => setLength(l)}
              >
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="generate__field">
          <label className="generate__label">Audience</label>
          <div className="generate__optionGrid">
            {AUDIENCES.map((a) => (
              <button
                key={a}
                type="button"
                className={`generate__optionBtn${audience === a ? ' generate__optionBtn--active' : ''}`}
                onClick={() => setAudience(a)}
              >
                {a.charAt(0).toUpperCase() + a.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="generate__field">
          <label className="generate__label">
            Custom Question <span className="generate__hint">(optional, max 300 chars)</span>
          </label>
          <textarea
            className="generate__textarea"
            placeholder="e.g. Which Ivy League school has the most enrollment growth among Hispanic students?"
            value={customQuestion}
            maxLength={300}
            onChange={(e) => setCustomQuestion(e.target.value)}
          />
        </div>

        <div className="generate__submitRow">
          <button
            className="generate__submitBtn"
            type="button"
            onClick={handleSubmit}
            disabled={busy}
          >
            {busy ? 'Generating draft…' : 'Generate Draft'}
          </button>
          {busy && (
            <div className="generate__loading">
              <div className="generate__spinner" />
              <span className="generate__spinnerText">This may take 15–30 seconds. The AI picks chart types per section.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <RequireAuth>
      <GenerateForm />
    </RequireAuth>
  );
}

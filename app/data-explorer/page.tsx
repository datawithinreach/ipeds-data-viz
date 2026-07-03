'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import institutionIds from '@/data/institution_ids.json';
import './page.scss';

const ALL_NAMES = Object.keys(institutionIds as Record<string, number>).sort();

type SurveyCode = 'admissions' | 'tuition' | 'enrollment' | 'completions' | 'graduation';

type InstitutionResult = {
  college: string;
  unit_id: string;
  surveys: Partial<Record<SurveyCode, Record<string, string>>>;
  variables: Partial<Record<SurveyCode, Record<string, string>>>;
};

type ApiError = { error: string; suggestions?: string[] };

async function fetchInstitution(name: string): Promise<InstitutionResult> {
  const res = await fetch(`/api/institutions/${encodeURIComponent(name)}`);
  if (!res.ok) {
    const err = (await res.json()) as ApiError;
    const e = new Error(err.error ?? 'Failed to fetch') as Error & { suggestions?: string[] };
    e.suggestions = err.suggestions;
    throw e;
  }
  return res.json();
}

function num(v: string | undefined): number | null {
  if (v === undefined || v === '' || v === '.') return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

function fmtInt(n: number | null): string {
  return n == null ? '—' : Math.round(n).toLocaleString();
}

function fmtPct(n: number | null, decimals = 1): string {
  return n == null ? '—' : `${n.toFixed(decimals)}%`;
}

function fmtMoney(n: number | null): string {
  if (n == null) return '—';
  return `$${Math.round(n).toLocaleString()}`;
}

function fmtRange(lo: number | null, hi: number | null): string {
  if (lo == null && hi == null) return '—';
  if (lo == null || hi == null) return fmtInt(lo ?? hi);
  return `${fmtInt(lo)}–${fmtInt(hi)}`;
}

const ADMCON_LABELS: Record<string, string> = {
  ADMCON1: 'Secondary school GPA',
  ADMCON2: 'Secondary school rank',
  ADMCON3: 'Secondary school record',
  ADMCON4: 'College-prep program completion',
  ADMCON5: 'Recommendations',
  ADMCON6: 'Formal demonstration of competencies',
  ADMCON7: 'Admission test scores',
  ADMCON8: 'English Proficiency Test',
  ADMCON9: 'Other test (Wonderlic, WISC, etc.)',
  ADMCON10: 'Work experience',
  ADMCON11: 'Personal statement / essay',
  ADMCON12: 'Legacy status',
};

const ADMCON_VALUE_LABEL: Record<string, string> = {
  '1': 'Required',
  '2': 'Recommended',
  '3': 'Neither required nor recommended',
  '4': 'Not used',
  '5': 'Considered if submitted',
};

const RACE_VARIABLES: { code: string; label: string }[] = [
  { code: 'EFWHITT', label: 'White' },
  { code: 'EFASIAT', label: 'Asian' },
  { code: 'EFBKAAT', label: 'Black / African-American' },
  { code: 'EFHISPT', label: 'Hispanic / Latino' },
  { code: 'EFAIANT', label: 'American Indian / Alaska Native' },
  { code: 'EFNHPIT', label: 'Native Hawaiian / Pacific Islander' },
  { code: 'EF2MORT', label: 'Two or more races' },
  { code: 'EFNRALT', label: 'Non-resident alien' },
  { code: 'EFUNKNT', label: 'Race / ethnicity unknown' },
];

export default function DataExplorerPage() {
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  const autocompleteSuggestions = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    const prefix: string[] = [];
    const substr: string[] = [];
    for (const name of ALL_NAMES) {
      const lower = name.toLowerCase();
      if (lower.startsWith(q)) prefix.push(name);
      else if (lower.includes(q)) substr.push(name);
    }
    return [...prefix, ...substr].slice(0, 8);
  }, [input]);

  const { data, isFetching, error } = useQuery({
    queryKey: ['institution', search],
    queryFn: () => fetchInstitution(search),
    enabled: !!search,
    retry: false,
  });

  const errorSuggestions = (error as (Error & { suggestions?: string[] }) | undefined)?.suggestions ?? [];

  function runSearch(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setInput(trimmed);
    setSearch(trimmed);
    setShowAutocomplete(false);
  }

  useEffect(() => {
    if (!input) setShowAutocomplete(false);
  }, [input]);

  return (
    <div className="dataExplorer">
      <div className="dataExplorer__header">
        <h1 className="dataExplorer__title">DATA EXPLORER</h1>
        <p className="dataExplorer__subtitle">
          Look up a US university across IPEDS surveys: admissions, tuition, enrollment, graduation, completions.
        </p>
      </div>

      <div className="dataExplorer__searchRow">
        <div className="dataExplorer__searchBarWrap">
          <div className="dataExplorer__searchBar">
            <Image src="/icons/search.png" alt="Search" width={18} height={18} />
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setShowAutocomplete(true);
              }}
              onFocus={() => setShowAutocomplete(true)}
              onBlur={() => setTimeout(() => setShowAutocomplete(false), 150)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (autocompleteSuggestions.length > 0) runSearch(autocompleteSuggestions[0]);
                  else runSearch(input);
                }
              }}
              placeholder="Search by university name…"
              className="dataExplorer__searchInput"
            />
          </div>
          {showAutocomplete && autocompleteSuggestions.length > 0 && (
            <ul className="dataExplorer__autocomplete">
              {autocompleteSuggestions.map((name) => (
                <li key={name}>
                  <button
                    type="button"
                    className="dataExplorer__autocompleteItem"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      runSearch(name);
                    }}
                  >
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button onClick={() => runSearch(input)} className="dataExplorer__searchBtn">
          Search
        </button>
      </div>

      {isFetching && <p className="dataExplorer__loading">Loading…</p>}

      {error && (
        <div className="dataExplorer__errorBox">
          <p className="dataExplorer__error">{(error as Error).message}</p>
          {errorSuggestions.length > 0 && (
            <>
              <p className="dataExplorer__errorHint">Did you mean:</p>
              <ul className="dataExplorer__suggestionsList">
                {errorSuggestions.map((name) => (
                  <li key={name}>
                    <button
                      type="button"
                      className="dataExplorer__autocompleteItem"
                      onClick={() => runSearch(name)}
                    >
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {data && !isFetching && <InstitutionView data={data} />}
    </div>
  );
}

function InstitutionView({ data }: { data: InstitutionResult }) {
  const adm = data.surveys.admissions ?? {};
  const tu = data.surveys.tuition ?? {};
  const en = data.surveys.enrollment ?? {};
  const co = data.surveys.completions ?? {};
  const gr = data.surveys.graduation ?? {};

  const applicants = num(adm.APPLCN);
  const admits = num(adm.ADMSSN);
  const enrolledFromAdm = num(adm.ENRLT);
  const admitRate = applicants && admits != null && applicants > 0 ? (admits / applicants) * 100 : null;
  const yieldRate = admits && enrolledFromAdm != null && admits > 0 ? (enrolledFromAdm / admits) * 100 : null;

  const totalEnrollment = num(en.EFTOTLT);
  const gradRate = num(gr.GRADRATE_BACH);
  const tuition2 = num(tu.TUITION2);
  const tuition3 = num(tu.TUITION3);

  const sat = {
    v25: num(adm.SATVR25), v50: num(adm.SATVR50), v75: num(adm.SATVR75),
    m25: num(adm.SATMT25), m50: num(adm.SATMT50), m75: num(adm.SATMT75),
    pct: num(adm.SATPCT),
  };
  const act = {
    c25: num(adm.ACTCM25), c50: num(adm.ACTCM50), c75: num(adm.ACTCM75),
    e25: num(adm.ACTEN25), e50: num(adm.ACTEN50), e75: num(adm.ACTEN75),
    m25: num(adm.ACTMT25), m50: num(adm.ACTMT50), m75: num(adm.ACTMT75),
    pct: num(adm.ACTPCT),
  };

  const enrollmentByRace = RACE_VARIABLES.map((r) => ({
    label: r.label,
    code: r.code,
    value: num(en[r.code]),
    pct: totalEnrollment && num(en[r.code]) != null ? (num(en[r.code])! / totalEnrollment) * 100 : null,
  })).filter((r) => r.value != null && r.value > 0);

  const completionsTotal = num(co.CTOTALT);
  const numPrograms = num(co.NUM_PROGRAMS);
  const cohort = num(gr.COHORT_GRTOTLT);
  const completers = num(gr.COMP_GRTOTLT);

  const considerations = Object.entries(ADMCON_LABELS)
    .map(([code, label]) => ({ code, label, value: adm[code] }))
    .filter((c) => c.value);

  const grouped: Record<string, typeof considerations> = {};
  for (const c of considerations) {
    const k = ADMCON_VALUE_LABEL[c.value!] ?? `Code ${c.value}`;
    if (!grouped[k]) grouped[k] = [];
    grouped[k].push(c);
  }
  const considerationOrder = ['Required', 'Recommended', 'Considered if submitted', 'Neither required nor recommended', 'Not used'];

  return (
    <div className="institution">
      <header className="institution__header">
        <h2 className="institution__name">{data.college}</h2>
        <p className="institution__subhead">IPEDS Unit ID {data.unit_id} · 2023–24 reporting cycle</p>
      </header>

      <section className="institution__kpis">
        <KpiCard label="Admit rate" value={fmtPct(admitRate)} />
        <KpiCard label="Yield rate" value={fmtPct(yieldRate)} />
        <KpiCard label="Total enrollment" value={fmtInt(totalEnrollment)} />
        <KpiCard label="6-yr grad rate" value={fmtPct(gradRate)} />
        <KpiCard label="Out-of-state tuition" value={fmtMoney(tuition3 ?? tuition2)} />
      </section>

      {(applicants != null || admits != null || enrolledFromAdm != null) && (
        <SectionCard title="Application funnel" subtitle="Source: IPEDS ADM2023">
          <div className="kvGrid">
            <div className="kvCell"><span>Applicants</span><strong>{fmtInt(applicants)}</strong></div>
            <div className="kvCell"><span>Admitted</span><strong>{fmtInt(admits)}</strong></div>
            <div className="kvCell"><span>Enrolled (first-time)</span><strong>{fmtInt(enrolledFromAdm)}</strong></div>
            <div className="kvCell"><span>Admit rate</span><strong>{fmtPct(admitRate)}</strong></div>
            <div className="kvCell"><span>Yield rate</span><strong>{fmtPct(yieldRate)}</strong></div>
          </div>
          <h4 className="institution__subheading">By gender</h4>
          <table className="dataTable">
            <thead>
              <tr><th></th><th>Men</th><th>Women</th><th>Other</th><th>Unknown</th></tr>
            </thead>
            <tbody>
              <tr><td>Applicants</td><td>{fmtInt(num(adm.APPLCNM))}</td><td>{fmtInt(num(adm.APPLCNW))}</td><td>{fmtInt(num(adm.APPLCNAN))}</td><td>{fmtInt(num(adm.APPLCNUN))}</td></tr>
              <tr><td>Admits</td><td>{fmtInt(num(adm.ADMSSNM))}</td><td>{fmtInt(num(adm.ADMSSNW))}</td><td>{fmtInt(num(adm.ADMSSNAN))}</td><td>{fmtInt(num(adm.ADMSSNUN))}</td></tr>
              <tr><td>Enrolled</td><td>{fmtInt(num(adm.ENRLM))}</td><td>{fmtInt(num(adm.ENRLW))}</td><td>{fmtInt(num(adm.ENRLAN))}</td><td>{fmtInt(num(adm.ENRLUN))}</td></tr>
            </tbody>
          </table>
        </SectionCard>
      )}

      {(sat.v25 != null || act.c25 != null) && (
        <SectionCard title="Admission test scores" subtitle="Middle 50% of admitted students who submitted">
          {sat.v25 != null && (
            <>
              <h4 className="institution__subheading">SAT</h4>
              <table className="dataTable">
                <thead><tr><th></th><th>25th</th><th>50th</th><th>75th</th></tr></thead>
                <tbody>
                  <tr><td>Verbal</td><td>{fmtInt(sat.v25)}</td><td>{fmtInt(sat.v50)}</td><td>{fmtInt(sat.v75)}</td></tr>
                  <tr><td>Math</td><td>{fmtInt(sat.m25)}</td><td>{fmtInt(sat.m50)}</td><td>{fmtInt(sat.m75)}</td></tr>
                  <tr><td>Combined mid-50%</td><td colSpan={3}>{fmtRange((sat.v25 ?? 0) + (sat.m25 ?? 0) || null, (sat.v75 ?? 0) + (sat.m75 ?? 0) || null)}</td></tr>
                </tbody>
              </table>
              {sat.pct != null && <p className="institution__note">{fmtPct(sat.pct, 0)} of enrolled students submitted SAT scores.</p>}
            </>
          )}
          {act.c25 != null && (
            <>
              <h4 className="institution__subheading">ACT</h4>
              <table className="dataTable">
                <thead><tr><th></th><th>25th</th><th>50th</th><th>75th</th></tr></thead>
                <tbody>
                  <tr><td>Composite</td><td>{fmtInt(act.c25)}</td><td>{fmtInt(act.c50)}</td><td>{fmtInt(act.c75)}</td></tr>
                  <tr><td>English</td><td>{fmtInt(act.e25)}</td><td>{fmtInt(act.e50)}</td><td>{fmtInt(act.e75)}</td></tr>
                  <tr><td>Math</td><td>{fmtInt(act.m25)}</td><td>{fmtInt(act.m50)}</td><td>{fmtInt(act.m75)}</td></tr>
                </tbody>
              </table>
              {act.pct != null && <p className="institution__note">{fmtPct(act.pct, 0)} of enrolled students submitted ACT scores.</p>}
            </>
          )}
        </SectionCard>
      )}

      {(tuition2 != null || tuition3 != null) && (
        <SectionCard title="Tuition & fees" subtitle="Published price, 2023–24 academic year">
          <div className="kvGrid">
            {tuition2 != null && <div className="kvCell"><span>In-state tuition</span><strong>{fmtMoney(tuition2)}</strong></div>}
            {num(tu.FEE2) != null && <div className="kvCell"><span>In-state fees</span><strong>{fmtMoney(num(tu.FEE2))}</strong></div>}
            {tuition3 != null && <div className="kvCell"><span>Out-of-state tuition</span><strong>{fmtMoney(tuition3)}</strong></div>}
            {num(tu.FEE3) != null && <div className="kvCell"><span>Out-of-state fees</span><strong>{fmtMoney(num(tu.FEE3))}</strong></div>}
            {num(tu.TUITION5) != null && <div className="kvCell"><span>In-state grad tuition</span><strong>{fmtMoney(num(tu.TUITION5))}</strong></div>}
            {num(tu.TUITION7) != null && <div className="kvCell"><span>Out-of-state grad tuition</span><strong>{fmtMoney(num(tu.TUITION7))}</strong></div>}
          </div>
        </SectionCard>
      )}

      {totalEnrollment != null && (
        <SectionCard title="Fall enrollment" subtitle="Source: IPEDS EF_A 2023">
          <div className="kvGrid">
            <div className="kvCell"><span>Total students</span><strong>{fmtInt(totalEnrollment)}</strong></div>
            <div className="kvCell"><span>Men</span><strong>{fmtInt(num(en.EFTOTLM))}</strong></div>
            <div className="kvCell"><span>Women</span><strong>{fmtInt(num(en.EFTOTLW))}</strong></div>
          </div>
          {enrollmentByRace.length > 0 && (
            <>
              <h4 className="institution__subheading">By race / ethnicity</h4>
              <table className="dataTable">
                <thead><tr><th>Group</th><th className="dataTable__num">Students</th><th className="dataTable__num">Share</th></tr></thead>
                <tbody>
                  {enrollmentByRace.map((r) => (
                    <tr key={r.code}>
                      <td>{r.label}</td>
                      <td className="dataTable__num">{fmtInt(r.value)}</td>
                      <td className="dataTable__num">{fmtPct(r.pct)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </SectionCard>
      )}

      {(gradRate != null || cohort != null) && (
        <SectionCard title="Graduation rate" subtitle="Bachelor's 6-year cohort, source: IPEDS GR 2023">
          <div className="kvGrid">
            <div className="kvCell"><span>6-year grad rate</span><strong>{fmtPct(gradRate)}</strong></div>
            {cohort != null && <div className="kvCell"><span>Cohort size</span><strong>{fmtInt(cohort)}</strong></div>}
            {completers != null && <div className="kvCell"><span>Completers (within 150% time)</span><strong>{fmtInt(completers)}</strong></div>}
          </div>
        </SectionCard>
      )}

      {completionsTotal != null && (
        <SectionCard title="Bachelor's degrees awarded" subtitle="Source: IPEDS C_A 2022">
          <div className="kvGrid">
            <div className="kvCell"><span>Degrees awarded</span><strong>{fmtInt(completionsTotal)}</strong></div>
            {num(co.CTOTALM) != null && <div className="kvCell"><span>To men</span><strong>{fmtInt(num(co.CTOTALM))}</strong></div>}
            {num(co.CTOTALW) != null && <div className="kvCell"><span>To women</span><strong>{fmtInt(num(co.CTOTALW))}</strong></div>}
            {numPrograms != null && <div className="kvCell"><span>Distinct CIP programs</span><strong>{fmtInt(numPrograms)}</strong></div>}
          </div>
        </SectionCard>
      )}

      {considerations.length > 0 && (
        <SectionCard title="Admission considerations" subtitle="What this school says it weighs in admissions">
          <div className="considerations">
            {considerationOrder.map((bucket) => {
              const items = grouped[bucket];
              if (!items || items.length === 0) return null;
              return (
                <div key={bucket} className={`considerations__col considerations__col--${bucket.toLowerCase().replace(/\s+/g, '-').slice(0, 16)}`}>
                  <h4>{bucket}</h4>
                  <ul>
                    {items.map((c) => <li key={c.code}>{c.label}</li>)}
                  </ul>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      <RawDataDetails data={data} />
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="kpi">
      <div className="kpi__value">{value}</div>
      <div className="kpi__label">{label}</div>
    </div>
  );
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="institution__section">
      <header className="institution__sectionHeader">
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </header>
      <div className="institution__sectionBody">{children}</div>
    </section>
  );
}

function RawDataDetails({ data }: { data: InstitutionResult }) {
  const surveyOrder: SurveyCode[] = ['admissions', 'tuition', 'enrollment', 'completions', 'graduation'];
  const [open, setOpen] = useState(false);
  return (
    <details className="institution__rawDetails" open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary>Show full raw IPEDS values ({open ? 'hide' : 'expand'})</summary>
      <div className="institution__rawBody">
        {surveyOrder.map((code) => {
          const row = data.surveys[code];
          const desc = data.variables[code];
          if (!row || !desc) return null;
          return (
            <details key={code} className="institution__rawSurvey">
              <summary>{code}</summary>
              <table className="dataTable dataTable--mono">
                <thead>
                  <tr><th>Code</th><th>Description</th><th className="dataTable__num">Value</th></tr>
                </thead>
                <tbody>
                  {Object.entries(row).map(([code, value]) => (
                    <tr key={code}>
                      <td className="dataTable__code">{code}</td>
                      <td>{desc[code] ?? '—'}</td>
                      <td className="dataTable__num">{value || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          );
        })}
      </div>
    </details>
  );
}

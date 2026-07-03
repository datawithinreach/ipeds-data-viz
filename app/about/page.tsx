import type { Metadata } from 'next';
import Link from 'next/link';
import './page.scss';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Inside College Data publishes IPEDS-driven stories about US higher education, written with an AI-assisted editorial workflow and reviewed by humans.',
};

export default function AboutPage() {
  return (
    <article className="about">
      <header className="about__hero">
        <h1>About Inside College Data</h1>
        <p>
          We publish short, evidence-driven stories about US higher education using public data from
          the National Center for Education Statistics&rsquo; Integrated Postsecondary Education
          Data System (<a href="https://nces.ed.gov/ipeds" target="_blank" rel="noreferrer">IPEDS</a>).
        </p>
      </header>

      <section className="about__section">
        <h2>What we cover</h2>
        <p>
          Five IPEDS surveys power every chart on the site:
        </p>
        <ul>
          <li><strong>Admissions</strong> — applications, admits, enrollment, SAT/ACT score percentiles, and computed admit and yield rates.</li>
          <li><strong>Tuition &amp; fees</strong> — published in-state, out-of-state, and program-specific charges.</li>
          <li><strong>Fall enrollment</strong> — total enrollment with race, ethnicity, and gender breakdowns.</li>
          <li><strong>Completions</strong> — bachelor&rsquo;s degrees awarded across all CIP program areas.</li>
          <li><strong>Graduation rates</strong> — bachelor&rsquo;s 6-year cohort completion (within 150% of normal time).</li>
        </ul>
      </section>

      <section className="about__section">
        <h2>How an article gets written</h2>
        <ol>
          <li>
            <strong>Pick the data.</strong> An author chooses institutions and IPEDS variables on
            the <Link href="/generate">Generate</Link> page.
          </li>
          <li>
            <strong>AI drafts the story.</strong> A language model writes a structured draft —
            intro, sections, and chart specs — grounded only in the values from the data brief. No
            invented numbers.
          </li>
          <li>
            <strong>Human-in-the-loop editing.</strong> The author edits any section, regenerates a
            section with new instructions, swaps chart types, or asks the AI to revise individual
            charts in plain English (&ldquo;make this a line chart and add Stanford&rdquo;).
          </li>
          <li>
            <strong>Editorial review.</strong> Submitted drafts go to an editor queue. An editor
            can approve, reject with feedback, or open the same editor and fix issues directly
            before approving.
          </li>
          <li>
            <strong>Publication.</strong> Approved stories appear on the homepage alongside our
            staff-written editorial pieces.
          </li>
        </ol>
      </section>

      <section className="about__section">
        <h2>Why IPEDS, why charts</h2>
        <p>
          IPEDS is the most comprehensive, free, federally-collected dataset on US postsecondary
          institutions. Every degree-granting school participates. We pull data straight from the
          NCES Final Release files, surface specific variables, and let writers compare schools
          side by side rather than relying on rankings or marketing copy.
        </p>
        <p>
          Charts are spec-based: each chart stores its institution list, variable list, and
          chart-type choice. When you load a story, the bars are hydrated with current values from
          our IPEDS snapshot. That means corrections to source data flow through automatically.
        </p>
      </section>

      <section className="about__section">
        <h2>Data scope &amp; freshness</h2>
        <p>
          The current snapshot covers 102 selected US universities for IPEDS years 2019–2023
          (admissions, enrollment, tuition, graduation) and 2018–2022 (completions). Year labels
          match IPEDS conventions: a 2023 ADM file describes the 2023–24 admissions cycle. We
          refresh the snapshot when NCES posts new Final Release data.
        </p>
      </section>

      <section className="about__section">
        <h2>Computed metrics</h2>
        <p>
          A few rates aren&rsquo;t in the raw IPEDS files but are obvious to compute from them. We
          add them as first-class variables so they can be charted directly:
        </p>
        <ul>
          <li><code>ADMIT_RATE_PCT</code> — admits ÷ applicants (selectivity)</li>
          <li><code>YIELD_RATE_PCT</code> — enrolled ÷ admits (yield)</li>
          <li><code>ENROLL_FROM_APPL_PCT</code> — enrolled ÷ applicants (full-funnel conversion)</li>
          <li><code>GRADRATE_BACH</code> — bachelor&rsquo;s 6-year graduation rate</li>
        </ul>
      </section>

      <section className="about__section">
        <h2>Contributing</h2>
        <p>
          Anyone with an account can generate, edit, and submit a story for review. Sign up
          on <Link href="/signup">the signup page</Link>, then head to <Link href="/generate">Generate</Link>.
          Submissions are reviewed by editors; approved pieces are credited to the contributor and
          carry a &ldquo;Community&rdquo; badge on the homepage.
        </p>
      </section>

      <section className="about__source">
        <p>
          <strong>Data source.</strong> All charts cite IPEDS (Integrated Postsecondary Education
          Data System) from the National Center for Education Statistics, US Department of
          Education. We do not modify reported values. Methodology is documented per article.
        </p>
      </section>
    </article>
  );
}

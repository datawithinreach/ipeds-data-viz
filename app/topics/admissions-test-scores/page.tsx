import Navbar from '@/components/Navbar';
import AdmissionsComparisonChart from '@/components/charts/AdmissionsComparisonChart';
import Link from 'next/link';

export default function AdmissionsTestScoresPage() {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          {/* Breadcrumb */}
          <nav className="mb-4 text-sm text-gray-500">
            <Link href="/" className="hover:text-accent transition-colors">
              Home
            </Link>
            <span className="mx-2">&gt;</span>
            <span className="text-gray-700">Admissions &amp; Test Scores</span>
          </nav>

          <h1 className="text-primary max-w-3xl text-3xl leading-tight font-extrabold tracking-tight md:text-4xl">
            Admissions &amp; Test Scores: how selective are institutions, and
            what scores do students need?
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600">
            Higher education admissions have grown increasingly competitive. But
            how do test score expectations vary across institutions, and what do
            trends tell us about the future of selective admissions?
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-gray-500">
            <div>
              <span className="text-gray-400">By </span>
              <span className="font-medium text-gray-700">Boston College</span>
            </div>
            <div>February 2025</div>
          </div>
        </div>
      </header>

      {/* Main two-column layout */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          {/* Left column — scrolling article text */}
          <article className="lg:w-[42%]">
            <p className="text-[15px] leading-7 text-gray-700">
              The selectivity of postsecondary institutions has increased
              substantially over the past decade. Applications to the most
              competitive universities have risen by more than 70% since 2016,
              while admit rates have fallen to single digits at many elite
              institutions.
            </p>

            <p className="mt-5 text-[15px] leading-7 text-gray-700">
              Growing awareness of this trend has fueled anxiety among students
              and families. Test-optional policies, adopted widely during the
              pandemic, have further complicated the picture, leading to
              record-breaking application volumes at many institutions while
              raising questions about the role standardized tests play in
              holistic review.
            </p>

            <p className="mt-5 text-[15px] leading-7 text-gray-700">
              In the chart here we compare peer institutions across a number of
              admissions metrics: SAT Math scores, SAT Evidence-Based Reading
              and Writing scores, ACT Composite scores, and acceptance rates.
              These are reported as 75th-percentile figures for enrolled
              students.
            </p>

            <p className="mt-5 text-[15px] leading-7 text-gray-700">
              Institutions at the top of the selectivity spectrum, those with
              acceptance rates below 10%, tend to cluster tightly on test
              scores. The difference between a 5% and a 12% acceptance rate
              institution may be only 20 to 30 points on the SAT, suggesting that
              test scores alone are a poor differentiator at the highest levels
              of selectivity.
            </p>

            <h2 className="mt-10 text-xl font-bold text-gray-900">
              Acceptance rates have fallen sharply
            </h2>

            <p className="mt-4 text-[15px] leading-7 text-gray-700">
              Between 2016 and 2024, the average acceptance rate among highly
              selective institutions dropped from roughly 19% to under 8%. This
              decline was driven by a combination of factors: a growing
              college-age population, increased international applications, and
              the removal of application barriers through test-optional and
              Common App adoption.
            </p>

            <p className="mt-5 text-[15px] leading-7 text-gray-700">
              Crucially, the decline in acceptance rates does not necessarily
              mean that students today are more qualified. Rather, the expansion
              of the applicant pool has diluted the ratio of admits to
              applicants, making raw acceptance rates a poor proxy for
              institutional quality or student preparedness.
            </p>

            <h2 className="mt-10 text-xl font-bold text-gray-900">
              What role do test scores play?
            </h2>

            <p className="mt-4 text-[15px] leading-7 text-gray-700">
              Despite the rise of test-optional admissions, standardized test
              scores remain a significant factor at many institutions. The
              75th-percentile SAT Math score at the most selective schools
              hovers near 800, while Evidence-Based Reading and Writing scores
              cluster in the 770 to 790 range.
            </p>

            <p className="mt-5 text-[15px] leading-7 text-gray-700">
              ACT Composite scores follow a similar pattern. Among the most
              selective institutions, 75th-percentile composites typically range
              from 35 to 36, effectively at the test ceiling. This compression
              at the top suggests that for the most competitive applicant pools,
              test scores serve more as a threshold than a differentiator.
            </p>

            <p className="mt-5 text-[15px] leading-7 text-gray-700">
              For students and families, the practical implication is clear:
              meeting the test-score threshold is necessary but rarely
              sufficient.               Holistic factors like extracurriculars, essays, letters
              of recommendation, and demonstrated interest carry increasing
              weight in admissions decisions.
            </p>

            <h2 className="mt-10 text-xl font-bold text-gray-900">
              Looking ahead
            </h2>

            <p className="mt-4 text-[15px] leading-7 text-gray-700">
              As institutions continue to evaluate the merits of test-optional
              policies, and as application volumes show no sign of declining,
              the admissions landscape is likely to grow more complex.
              Transparency in reporting, through systems like IPEDS, will be
              essential for helping students make informed decisions.
            </p>

            <p className="mt-5 mb-4 text-[15px] leading-7 text-gray-700">
              Understanding these metrics in context, not as isolated numbers
              but as part of a broader institutional profile, remains the most
              reliable guide for prospective students navigating an increasingly
              competitive process.
            </p>
          </article>

          {/* Right column — sticky chart */}
          <aside className="lg:w-[58%]">
            <div className="lg:sticky lg:top-6">
              <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <AdmissionsComparisonChart />
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <p className="text-xs text-gray-400">
            Data sourced from the Integrated Postsecondary Education Data System
            (IPEDS), National Center for Education Statistics.
          </p>
        </div>
      </footer>
    </div>
  );
}

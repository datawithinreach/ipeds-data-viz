'use client';

import Navbar from '@/components/Navbar';
import HeroCarousel from '@/components/HeroCarousel';
import StatCard from '@/components/StatCard';
import ChartSection from '@/components/ChartSection';
import DemographicLegend from '@/components/DemographicLegend';
import EnrollmentBarChart from '@/components/charts/EnrollmentBarChart';
import GraduationLineChart from '@/components/charts/GraduationLineChart';
import DemographicDonut from '@/components/charts/DemographicDonut';
import DegreeBarChart from '@/components/charts/DegreeBarChart';
import TuitionLineChart from '@/components/charts/TuitionLineChart';
import {
  enrollmentData,
  graduationData,
  demographicData,
  degreeFieldData,
  tuitionData,
  summaryStats,
} from '@/lib/mockData';

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      <HeroCarousel />

      <main className="mx-auto max-w-7xl px-6">
        {/* Stats Overview */}
        <section id="overview" className="py-16">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Key Statistics</h2>
            <p className="mt-3 text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Total Enrollment"
              value={summaryStats.totalEnrollment}
              description="Full-time and part-time students for 2024"
            />
            <StatCard
              label="Graduation Rate"
              value={summaryStats.graduationRate}
              description="6-year completion rate for first-time students"
            />
            <StatCard
              label="Acceptance Rate"
              value={summaryStats.acceptanceRate}
              description="Percentage of applicants offered admission"
            />
            <StatCard
              label="Avg. Financial Aid"
              value={summaryStats.avgFinancialAid}
              description="Average institutional grant per aided student"
            />
            <StatCard
              label="Student-Faculty Ratio"
              value={summaryStats.studentFacultyRatio}
              description="Ratio of full-time students to faculty"
            />
            <StatCard
              label="Median Earnings"
              value={summaryStats.medianEarnings}
              description="Median earnings 10 years after enrollment"
            />
          </div>
        </section>

        <hr className="border-accent/20" />

        {/* Enrollment Chart */}
        <div id="enrollment">
          <ChartSection
            title="Enrollment Trends"
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Total student enrollment has shown steady growth over the past nine years, reflecting increased demand and expanding program offerings. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
          >
            <div className="border-accent/15 rounded-xl border bg-white p-6 shadow-sm">
              <EnrollmentBarChart data={enrollmentData} />
            </div>
          </ChartSection>
        </div>

        <hr className="border-accent/20" />

        {/* Graduation Rate Chart */}
        <div id="outcomes">
          <ChartSection
            title="Graduation Rates"
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. The six-year graduation rate has consistently improved, reaching a record high. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident."
            reversed
          >
            <div className="border-accent/15 rounded-xl border bg-white p-6 shadow-sm">
              <GraduationLineChart data={graduationData} />
            </div>
          </ChartSection>
        </div>

        <hr className="border-accent/20" />

        {/* Demographics Section */}
        <section className="py-12">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Student Demographics
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. The
              student body reflects a diverse range of backgrounds and
              experiences, contributing to a rich campus community.
            </p>
          </div>
          <div className="border-accent/15 mx-auto max-w-lg rounded-xl border bg-white p-6 shadow-sm">
            <DemographicDonut data={demographicData} />
            <DemographicLegend data={demographicData} />
          </div>
        </section>

        <hr className="border-accent/20" />

        {/* Degrees by Field */}
        <ChartSection
          title="Degrees by Field of Study"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Business, Economics, and Biology continue to be the most popular fields of study. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam."
        >
          <div className="border-accent/15 rounded-xl border bg-white p-6 shadow-sm">
            <DegreeBarChart data={degreeFieldData} />
          </div>
        </ChartSection>

        <hr className="border-accent/20" />

        {/* Tuition Chart */}
        <div id="costs">
          <ChartSection
            title="Tuition & Costs"
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Annual tuition has increased moderately year over year. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt."
            reversed
          >
            <div className="border-accent/15 rounded-xl border bg-white p-6 shadow-sm">
              <TuitionLineChart data={tuitionData} />
            </div>
          </ChartSection>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-accent/20 bg-primary-dark mt-16 border-t">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="bg-accent flex h-8 w-8 items-center justify-center rounded-lg">
                <svg
                  className="text-primary-dark h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                  />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">
                IPEDS DataViz
              </span>
            </div>
            <p className="text-accent-light/70 text-sm">
              Lorem ipsum dolor sit amet. Data sourced from the Integrated
              Postsecondary Education Data System.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

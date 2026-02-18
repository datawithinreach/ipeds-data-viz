import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import EnrollmentBarChart from '@/components/charts/EnrollmentBarChart';
import TuitionLineChart from '@/components/charts/TuitionLineChart';
import { enrollmentData, tuitionData } from '@/lib/mockData';
import { topicBySlug, topicLinks } from '@/lib/topicCatalog';

export function generateStaticParams() {
  return topicLinks
    .filter((topic) => topic.slug !== 'admissions-test-scores')
    .map((topic) => ({ slug: topic.slug }));
}

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = topicBySlug[slug];

  if (!topic) {
    notFound();
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <section className="border-accent/20 rounded-xl border bg-white p-8 shadow-sm">
          <p className="text-primary/70 text-xs font-semibold tracking-[0.14em] uppercase">
            Institutional Analytics Brief
          </p>
          <h1 className="text-primary mt-3 text-3xl font-bold tracking-tight">
            Standard Topic Analysis Template
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-gray-700">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
            vitae leo maximus, vehicula tortor quis, luctus sapien. Integer
            dictum sem vel ligula feugiat, eu pulvinar ligula bibendum.
          </p>
          <div className="border-accent/20 mt-6 grid grid-cols-1 gap-4 border-t pt-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Prepared For
              </p>
              <p className="mt-1 text-sm text-gray-700">
                Institutional Stakeholders
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Reporting Period
              </p>
              <p className="mt-1 text-sm text-gray-700">
                Lorem Ipsum 2024-2025
              </p>
            </div>
          </div>
        </section>

        <article className="border-accent/20 mt-8 rounded-xl border bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">
            Executive Summary
          </h2>
          <p className="mt-4 text-sm leading-7 text-gray-700">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
            convallis, justo eget gravida finibus, est nibh gravida ipsum, sed
            ullamcorper lacus justo sit amet risus. Suspendisse potenti. Sed non
            sem id velit tempor interdum. Aliquam erat volutpat.
          </p>
          <p className="mt-4 text-sm leading-7 text-gray-700">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean
            facilisis lacus non dui consequat, non tincidunt justo tempor. In ac
            ligula sit amet risus euismod luctus vitae vitae elit. Morbi
            ullamcorper faucibus ornare.
          </p>

          <h3 className="text-primary mt-8 text-lg font-semibold">
            Key Findings
          </h3>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-gray-700">
            <li className="bg-accent/10 rounded-md px-3 py-2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </li>
            <li className="bg-accent/10 rounded-md px-3 py-2">
              Fusce vestibulum neque et eros pellentesque, at vulputate massa
              pulvinar.
            </li>
            <li className="bg-accent/10 rounded-md px-3 py-2">
              Proin maximus lorem ut nisl dignissim, vel bibendum purus luctus.
            </li>
          </ul>
        </article>

        <section className="border-accent/20 mt-8 rounded-xl border bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">
            Section I: Enrollment and Access
          </h2>
          <p className="mt-3 text-sm leading-7 text-gray-700">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
            vitae urna tincidunt, aliquet lectus eget, efficitur lorem. Nullam
            congue ipsum at purus tempor, ac elementum magna interdum. Integer
            congue eu nisl ac ultrices.
          </p>
          <p className="mt-3 text-sm leading-7 text-gray-700">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
            tristique, nibh at facilisis ultricies, lorem nisi blandit felis, eu
            consequat enim arcu ac elit.
          </p>
          <div className="border-accent/15 mt-6 rounded-lg border bg-gray-50 p-5">
            <h3 className="text-primary mb-3 text-base font-semibold">
              Supporting Figure A
            </h3>
            <EnrollmentBarChart data={enrollmentData} />
          </div>
        </section>

        <section className="border-accent/20 mt-8 rounded-xl border bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">
            Section II: Cost and Affordability
          </h2>
          <p className="mt-3 text-sm leading-7 text-gray-700">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Pellentesque habitant morbi tristique senectus et netus et malesuada
            fames ac turpis egestas. Duis congue velit sed ipsum condimentum, id
            molestie diam tristique.
          </p>
          <p className="mt-3 text-sm leading-7 text-gray-700">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus
            non enim tincidunt, efficitur leo non, egestas dui. In ut aliquet
            erat. Donec sed ante et purus pharetra vulputate.
          </p>
          <div className="border-accent/15 mt-6 rounded-lg border bg-gray-50 p-5">
            <h3 className="text-primary mb-3 text-base font-semibold">
              Supporting Figure B
            </h3>
            <TuitionLineChart data={tuitionData} />
          </div>
        </section>

        <section className="border-accent/20 mt-8 rounded-xl border bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">
            Section III: Interpretation and Implications
          </h2>
          <p className="mt-3 text-sm leading-7 text-gray-700">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam
            maximus erat sed nibh iaculis, id tristique est malesuada. Curabitur
            condimentum ex in leo ultrices tincidunt. Aenean nec mauris
            sollicitudin, ultrices elit a, lobortis nisl.
          </p>
          <p className="mt-3 text-sm leading-7 text-gray-700">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
            viverra, turpis quis cursus hendrerit, augue magna pulvinar mi, eget
            tristique velit arcu ut leo. Donec feugiat lectus sit amet est
            congue, vel dapibus ligula cursus.
          </p>
          <h3 className="text-primary mt-7 text-lg font-semibold">
            Strategic Considerations
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="border-accent/20 bg-accent/10 rounded-md border p-3 text-sm text-gray-700">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </div>
            <div className="border-accent/20 bg-accent/10 rounded-md border p-3 text-sm text-gray-700">
              Sed euismod lorem quis odio maximus, a posuere dolor egestas.
            </div>
            <div className="border-accent/20 bg-accent/10 rounded-md border p-3 text-sm text-gray-700">
              Maecenas hendrerit sem at sapien iaculis, nec interdum libero
              aliquet.
            </div>
          </div>
        </section>

        <section className="border-accent/20 my-8 rounded-xl border bg-white p-8 shadow-sm">
          <h2 className="text-primary text-xl font-bold">
            Methodology and Notes
          </h2>
          <p className="mt-3 text-sm leading-7 text-gray-700">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam
            porttitor, sapien a malesuada luctus, tortor tortor convallis dui,
            at tincidunt libero mi sed metus. Nulla ac tortor massa.
          </p>
          <p className="mt-3 text-sm leading-7 text-gray-700">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam
            volutpat purus at leo finibus, sed eleifend nulla efficitur.
          </p>
        </section>
      </main>
    </div>
  );
}

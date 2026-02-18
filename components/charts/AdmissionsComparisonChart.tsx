'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridColumns } from '@visx/grid';
import { ParentSize } from '@visx/responsive';
import type {
  AdmissionsInstitution,
  AdmissionsCategory,
  AdmissionsResponse,
  ApiResponse,
} from '@/types';

const COLORS = {
  primary: '#334155',
  teal: '#0d9488',
  indigo: '#6366f1',
  sky: '#0ea5e9',
  amber: '#f59e0b',
};

const barColors = [
  COLORS.primary,
  COLORS.teal,
  COLORS.indigo,
  COLORS.sky,
  COLORS.amber,
];

type PanelConfig = {
  title: string;
  getValue: (d: AdmissionsInstitution) => number;
  format: (v: number) => string;
  domain: [number, number];
};

const panels: PanelConfig[] = [
  {
    title: 'SAT Math (75th percentile)',
    getValue: (d) => d.satMath75,
    format: (v) => `${v}`,
    domain: [0, 800],
  },
  {
    title: 'SAT ERW (75th percentile)',
    getValue: (d) => d.satERW75,
    format: (v) => `${v}`,
    domain: [0, 800],
  },
  {
    title: 'ACT Composite (75th percentile)',
    getValue: (d) => d.actComposite75,
    format: (v) => `${v}`,
    domain: [0, 36],
  },
  {
    title: 'Acceptance Rate',
    getValue: (d) => d.acceptanceRate,
    format: (v) => `${v}%`,
    domain: [0, 25],
  },
];

const margin = { top: 8, right: 55, bottom: 24, left: 100 };

function HorizontalBarPanel({
  config,
  data,
  width,
  height,
}: {
  config: PanelConfig;
  data: AdmissionsInstitution[];
  width: number;
  height: number;
}) {
  if (width < 10) return null;

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const yScale = scaleBand<string>({
    range: [0, yMax],
    domain: data.map((d) => d.name),
    padding: 0.35,
  });

  const xScale = scaleLinear<number>({
    range: [0, xMax],
    domain: config.domain,
    nice: true,
  });

  return (
    <div>
      <p className="mb-1 text-sm font-semibold text-gray-700">
        {config.title}
      </p>
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          <GridColumns
            scale={xScale}
            height={yMax}
            strokeDasharray="3,3"
            stroke="#e5e7eb"
            strokeOpacity={0.6}
            numTicks={4}
          />
          {data.map((d, i) => {
            const value = config.getValue(d);
            const barY = yScale(d.name) ?? 0;
            const barHeight = yScale.bandwidth();
            const barWidth = xScale(value);

            return (
              <g key={d.name}>
                <Bar
                  x={0}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  fill={barColors[i % barColors.length]}
                  rx={3}
                  opacity={0.85}
                />
                <text
                  x={barWidth + 4}
                  y={barY + barHeight / 2}
                  dy="0.35em"
                  fontSize={12}
                  fill="#374151"
                  fontFamily="inherit"
                >
                  {config.format(value)}
                </text>
              </g>
            );
          })}
          <AxisLeft
            scale={yScale}
            hideAxisLine
            hideTicks
            tickLabelProps={{
              fill: '#374151',
              fontSize: 11,
              textAnchor: 'end',
              dy: '0.33em',
              fontFamily: 'inherit',
            }}
          />
          <AxisBottom
            top={yMax}
            scale={xScale}
            numTicks={4}
            tickFormat={(v) => config.format(Number(v))}
            tickLabelProps={{
              fill: '#9ca3af',
              fontSize: 10,
              textAnchor: 'middle',
              fontFamily: 'inherit',
            }}
            stroke="#e5e7eb"
            tickStroke="#e5e7eb"
          />
        </Group>
      </svg>
    </div>
  );
}

function DataTable({ data }: { data: AdmissionsInstitution[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <th className="py-2 pr-4">Institution</th>
            <th className="px-3 py-2 text-right">SAT Math</th>
            <th className="px-3 py-2 text-right">SAT ERW</th>
            <th className="px-3 py-2 text-right">ACT</th>
            <th className="px-3 py-2 text-right">Accept.</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr
              key={d.name}
              className="border-b border-gray-100 text-gray-700"
            >
              <td className="py-2.5 pr-4 font-medium">{d.name}</td>
              <td className="px-3 py-2.5 text-right">
                {d.satMath25}–{d.satMath75}
              </td>
              <td className="px-3 py-2.5 text-right">
                {d.satERW25}–{d.satERW75}
              </td>
              <td className="px-3 py-2.5 text-right">
                {d.actComposite25}–{d.actComposite75}
              </td>
              <td className="px-3 py-2.5 text-right">{d.acceptanceRate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const SKELETON_WIDTHS = ['82%', '74%', '68%', '88%', '63%'];

function SkeletonPanel() {
  return (
    <div className="animate-pulse">
      <div className="mb-2 h-4 w-40 rounded bg-gray-200" />
      <div className="space-y-2">
        {SKELETON_WIDTHS.map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-3 w-16 rounded bg-gray-200" />
            <div className="h-5 rounded bg-gray-200" style={{ width: w }} />
          </div>
        ))}
      </div>
    </div>
  );
}

async function fetchAdmissions(): Promise<AdmissionsCategory[]> {
  const res = await fetch('/api/admissions');
  if (!res.ok) throw new Error('Failed to fetch admissions data');
  const json: ApiResponse<AdmissionsResponse> = await res.json();
  if (json.error) throw new Error(json.error);
  return json.data!.categories;
}

export default function AdmissionsComparisonChart() {
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const [categoryIdx, setCategoryIdx] = useState(0);

  const { data: categories, isLoading, isError, error } = useQuery({
    queryKey: ['admissions'],
    queryFn: fetchAdmissions,
    staleTime: 1000 * 60 * 60,
  });

  const activeCategory = categories?.[categoryIdx];
  const data = activeCategory?.data ?? [];

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900">
        Admissions profile
        {activeCategory ? `: ${activeCategory.label}` : ''}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-gray-500">
        {activeCategory
          ? `${activeCategory.description}. Test scores shown as 25th–75th percentile values for enrolled students. IPEDS ${new Date().getFullYear() > 2022 ? 2022 : 2022} data.`
          : 'Loading data from the Urban Institute Education Data Portal…'}
      </p>

      {/* Category selector */}
      {categories && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {categories.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => setCategoryIdx(i)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                i === categoryIdx
                  ? 'bg-slate-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-1 border-b border-gray-200">
        <button
          onClick={() => setView('table')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
            view === 'table'
              ? 'border-b-2 border-accent text-accent'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-12.75m0 0A1.125 1.125 0 0 1 3.375 4.5h17.25c.621 0 1.125.504 1.125 1.125m-20.625 0v12.75m20.625-12.75v12.75M21.75 5.625v12.75m0 0a1.125 1.125 0 0 1-1.125 1.125m1.125-1.125v-12.75"
            />
          </svg>
          Table
        </button>
        <button
          onClick={() => setView('chart')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
            view === 'chart'
              ? 'border-b-2 border-accent text-accent'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
            />
          </svg>
          Chart
        </button>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {panels.map((p) => (
              <SkeletonPanel key={p.title} />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Failed to load data</p>
            <p className="mt-1 text-xs text-red-500">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        ) : view === 'table' ? (
          <DataTable data={data} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {panels.map((panel) => (
              <ParentSize key={panel.title}>
                {({ width }) => (
                  <HorizontalBarPanel
                    config={panel}
                    data={data}
                    width={width}
                    height={200}
                  />
                )}
              </ParentSize>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 border-t border-gray-100 pt-3 text-[10px] leading-relaxed text-gray-400">
        Data source: IPEDS Admissions Survey 2022, via Education Data Portal
        (Urban Institute) &middot;{' '}
        <a
          href="https://educationdata.urban.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          educationdata.urban.org
        </a>
      </div>
    </div>
  );
}

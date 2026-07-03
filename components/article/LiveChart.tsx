'use client';

import { useEffect, useMemo, useState } from 'react';
import { BarChart, StackedBarChart, LineChart, PieChart, Heatmap, SlopeChart } from '@/components/visualizations';
import type { BarDatum, StackedBarDatum, StackedSegment, LineSeries, PieDatum, HeatmapCell, SlopeSeries } from '@/components/visualizations';
import { chartPalette } from '@/styles/palette';
import type { ChartSpec } from '@/lib/articles/types';

type CoverageWarning = {
  variable: string;
  variableLabel: string;
  institutions: string[];
};

type HydratedBarData = {
  type: 'bar' | 'line' | 'stackedBar' | 'pie' | 'heatmap' | 'slope';
  title: string;
  data: BarDatum[];
  missing?: CoverageWarning[];
  unknownInstitutions?: string[];
};

type HydratedTsData = {
  mode: 'timeSeries';
  title: string;
  series: { label: string; data: { x: string; y: number }[] }[];
  years: string[];
  missing?: CoverageWarning[];
  unknownInstitutions?: string[];
};

type HydratedData = HydratedBarData | HydratedTsData;

function isTimeSeries(d: HydratedData): d is HydratedTsData {
  return (d as HydratedTsData).mode === 'timeSeries';
}

function buildStacked(barData: BarDatum[]): { data: StackedBarDatum[]; segments: StackedSegment[] } {
  const groups = [...new Set(barData.map((d) => d.group).filter((g): g is string => !!g))];
  const segments: StackedSegment[] =
    groups.length > 0
      ? groups.map((g, i) => ({ key: g, label: g, color: chartPalette[i % chartPalette.length] }))
      : [{ key: 'value', label: 'Value', color: chartPalette[0] }];

  const byLabel = new Map<string, StackedBarDatum>();
  for (const d of barData) {
    if (!byLabel.has(d.label)) byLabel.set(d.label, { label: d.label });
    const row = byLabel.get(d.label)!;
    const segKey = d.group ?? 'value';
    row[segKey] = ((row[segKey] as number) ?? 0) + d.value;
  }
  return { data: Array.from(byLabel.values()), segments };
}

function buildLineSeries(barData: BarDatum[]): LineSeries[] {
  const groups = [...new Set(barData.map((d) => d.group).filter((g): g is string => !!g))];
  if (groups.length === 0) {
    return [
      {
        label: 'Value',
        color: chartPalette[0],
        data: barData.map((d) => ({ x: d.label, y: d.value })),
      },
    ];
  }
  return groups.map((g, i) => ({
    label: g,
    color: chartPalette[i % chartPalette.length],
    data: barData.filter((d) => d.group === g).map((d) => ({ x: d.label, y: d.value })),
  }));
}

function buildPieData(barData: BarDatum[]): PieDatum[] {
  // If grouped, sum each group across institutions; else use one slice per institution.
  const groups = [...new Set(barData.map((d) => d.group).filter((g): g is string => !!g))];
  if (groups.length > 0) {
    return groups.map((g, i) => ({
      label: g,
      color: chartPalette[i % chartPalette.length],
      value: barData.filter((d) => d.group === g).reduce((s, d) => s + d.value, 0),
    }));
  }
  return barData.map((d, i) => ({
    label: d.label,
    color: chartPalette[i % chartPalette.length],
    value: d.value,
  }));
}

function buildHeatmap(barData: BarDatum[]): { rows: string[]; cols: string[]; cells: HeatmapCell[]; categorical: boolean } {
  const rows = [...new Set(barData.map((d) => d.label))];
  const cols = [...new Set(barData.map((d) => d.group ?? 'Value'))];
  const cells: HeatmapCell[] = barData.map((d) => ({ row: d.label, col: d.group ?? 'Value', value: d.value }));
  // Categorical detection: all integer values within {1,2,3,4,5} → likely ADMCON
  const allCategorical = cells.every((c) => Number.isInteger(c.value) && c.value >= 1 && c.value <= 5);
  return { rows, cols, cells, categorical: allCategorical };
}

function buildSlopeFromTimeSeries(series: { label: string; data: { x: string; y: number }[] }[]): SlopeSeries[] {
  return series
    .filter((s) => s.data.length >= 2)
    .map((s, i) => ({
      label: s.label,
      color: chartPalette[i % chartPalette.length],
      start: s.data[0],
      end: s.data[s.data.length - 1],
    }));
}

function MissingDataCallout({ missing, unknown }: { missing?: CoverageWarning[]; unknown?: string[] }) {
  if ((!missing || missing.length === 0) && (!unknown || unknown.length === 0)) return null;
  return (
    <div className="article__callout" style={{ marginTop: 8 }}>
      <p className="article__calloutTitle">Some data is missing for the current selection:</p>
      <ul style={{ margin: '4px 0 0 1rem', paddingLeft: 0, fontSize: '0.85rem' }}>
        {unknown && unknown.length > 0 && (
          <li>
            Not in the dataset: <strong>{unknown.join(', ')}</strong>
          </li>
        )}
        {missing?.map((m) => (
          <li key={m.variable}>
            <strong>{m.variableLabel}</strong> ({m.variable}) — no value reported by:{' '}
            {m.institutions.join(', ')}
          </li>
        ))}
      </ul>
      <p style={{ marginTop: 6, fontSize: '0.8rem', color: '#666' }}>
        IPEDS often leaves fields blank when an institution doesn&rsquo;t report them (for example,
        elite 4-year schools rarely report part-time first-time enrollment). Try a different
        variable or institution.
      </p>
    </div>
  );
}

export function LiveChart({ spec }: { spec: ChartSpec }) {
  const [chartData, setChartData] = useState<HydratedData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/articles/hydrate-chart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(spec),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          setChartData(null);
          setError(data.error);
        } else {
          setError(null);
          setChartData(data);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [spec]);

  const stacked = useMemo(
    () => (chartData && !isTimeSeries(chartData) ? buildStacked(chartData.data) : null),
    [chartData],
  );
  const lineSeries = useMemo(
    () => (chartData && !isTimeSeries(chartData) ? buildLineSeries(chartData.data) : null),
    [chartData],
  );
  const pieData = useMemo(
    () => (chartData && !isTimeSeries(chartData) ? buildPieData(chartData.data) : null),
    [chartData],
  );
  const heatmapData = useMemo(
    () => (chartData && !isTimeSeries(chartData) ? buildHeatmap(chartData.data) : null),
    [chartData],
  );
  const slopeSeries = useMemo(
    () => (chartData && isTimeSeries(chartData) ? buildSlopeFromTimeSeries(chartData.series) : null),
    [chartData],
  );

  if (error) {
    return (
      <div className="article__callout">
        <p className="article__calloutTitle">Chart: {spec.title}</p>
        <p className="article__calloutText">Could not load chart data: {error}</p>
      </div>
    );
  }
  if (!chartData) {
    return (
      <div className="article__callout">
        <p className="article__calloutTitle">Loading chart…</p>
      </div>
    );
  }
  if (isTimeSeries(chartData)) {
    if (chartData.series.length === 0) {
      return (
        <div>
          <div className="article__callout">
            <p className="article__calloutTitle">No time-series data</p>
            <p className="article__calloutText">
              None of the selected institutions reported {spec.surveyCode} values across multiple years.
            </p>
          </div>
          <MissingDataCallout missing={chartData.missing} unknown={chartData.unknownInstitutions} />
        </div>
      );
    }
    // For time series, allow 'slope' to render a slopegraph, otherwise default to line chart.
    const useSlope = (spec.typeOverride ?? spec.type) === 'slope' && slopeSeries && slopeSeries.length > 0;
    return (
      <div>
        {useSlope ? (
          <SlopeChart series={slopeSeries!} title={chartData.title} contained />
        ) : (
          <LineChart
            series={chartData.series.map((s, i) => ({
              label: s.label,
              color: chartPalette[i % chartPalette.length],
              data: s.data,
            }))}
            title={chartData.title}
            contained
          />
        )}
        <MissingDataCallout missing={chartData.missing} unknown={chartData.unknownInstitutions} />
      </div>
    );
  }

  if (!chartData.data.length) {
    return (
      <div>
        <div className="article__callout">
          <p className="article__calloutTitle">No data to chart</p>
          <p className="article__calloutText">
            None of the selected institutions reported a value for these variables in the {spec.surveyCode} survey.
          </p>
        </div>
        <MissingDataCallout missing={chartData.missing} unknown={chartData.unknownInstitutions} />
      </div>
    );
  }

  let chart;
  const effectiveType = (spec.typeOverride ?? chartData.type) as 'bar' | 'line' | 'stackedBar' | 'pie' | 'heatmap' | 'slope';

  if (effectiveType === 'pie' && pieData) {
    return (
      <div>
        <PieChart data={pieData} title={chartData.title} contained donut={false} />
        <MissingDataCallout missing={chartData.missing} unknown={chartData.unknownInstitutions} />
      </div>
    );
  }
  if (effectiveType === 'heatmap' && heatmapData) {
    return (
      <div>
        <Heatmap
          rows={heatmapData.rows}
          cols={heatmapData.cols}
          cells={heatmapData.cells}
          categorical={heatmapData.categorical}
          title={chartData.title}
          contained
        />
        <MissingDataCallout missing={chartData.missing} unknown={chartData.unknownInstitutions} />
      </div>
    );
  }
  if (chartData.type === 'stackedBar' && stacked) {
    chart = (
      <div className="article__chart article__chart--contained">
        {chartData.title && <h3 className="article__chartTitle">{chartData.title}</h3>}
        <StackedBarChart
          data={stacked.data}
          segments={stacked.segments}
          height={Math.max(320, stacked.data.length * 38 + 60)}
          legend
        />
      </div>
    );
  } else if (chartData.type === 'line' && lineSeries) {
    chart = <LineChart series={lineSeries} title={chartData.title} contained />;
  } else {
    chart = <BarChart data={chartData.data} title={chartData.title} orientation="horizontal" contained />;
  }

  return (
    <div>
      {chart}
      <MissingDataCallout missing={chartData.missing} unknown={chartData.unknownInstitutions} />
    </div>
  );
}

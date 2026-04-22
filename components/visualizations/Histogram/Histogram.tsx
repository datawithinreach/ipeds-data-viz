'use client';

import { useMemo } from 'react';
import { scaleLinear } from '@visx/scale';
import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows, GridColumns } from '@visx/grid';
import { useParentSize } from '@visx/responsive';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { Text } from '@visx/text';
import { colors } from '@/styles/palette';
import './Histogram.scss';

export type HistogramBin = {
  x0: number;
  x1: number;
  count: number;
};

type Props = {
  /** Numeric observations to bin (e.g. enrollment, tuition). */
  data: number[];
  title?: string;
  subtitle?: string;
  xLabel?: string;
  yLabel?: string;
  height?: number;
  width?: number;
  /** Number of bins; when omitted, a default is chosen from sample size. */
  binCount?: number;
};

const PRIMARY = colors.primary;
const AXIS_COLOR = colors.primary;
const GRID_COLOR = `${colors.primary}15`;

function formatAxisNumber(v: number): string {
  return Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatCount(v: number): string {
  return Number(v).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });
}

function defaultBinCount(n: number): number {
  if (n <= 0) return 10;
  return Math.min(20, Math.max(5, Math.ceil(Math.log2(n) + 1)));
}

function computeBins(values: number[], binCount: number): HistogramBin[] {
  if (values.length === 0 || binCount < 1) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    const half = Math.abs(min) * 0.05 || 0.5;
    return [{ x0: min - half, x1: max + half, count: values.length }];
  }

  const step = (max - min) / binCount;
  const bins: HistogramBin[] = Array.from({ length: binCount }, (_, i) => ({
    x0: min + i * step,
    x1: min + (i + 1) * step,
    count: 0,
  }));

  for (const v of values) {
    let idx = Math.floor((v - min) / step);
    if (idx >= binCount) idx = binCount - 1;
    if (idx < 0) idx = 0;
    bins[idx].count += 1;
  }

  return bins;
}

export function Histogram({
  data,
  title,
  subtitle,
  xLabel,
  yLabel,
  height = 360,
  width: widthProp,
  binCount: binCountProp,
}: Props) {
  const { parentRef, width } = useParentSize();

  const margin = useMemo(
    () => ({
      top: 16,
      right: 24,
      bottom: xLabel ? 52 : 40,
      left: yLabel ? 72 : 56,
    }),
    [xLabel, yLabel]
  );

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const bins = useMemo(() => {
    const n = data.length;
    const k = binCountProp ?? defaultBinCount(n);
    return computeBins(data, k);
  }, [data, binCountProp]);

  const maxCount = useMemo(
    () => (bins.length ? Math.max(...bins.map((b) => b.count), 1) : 1),
    [bins]
  );

  const xMin = bins.length ? Math.min(...bins.map((b) => b.x0)) : 0;
  const xMax = bins.length ? Math.max(...bins.map((b) => b.x1)) : 1;

  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [xMin, xMax],
        range: [0, innerWidth],
        nice: true,
      }),
    [xMin, xMax, innerWidth]
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, maxCount],
        range: [innerHeight, 0],
        nice: true,
      }),
    [innerHeight, maxCount]
  );

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = useTooltip<HistogramBin>();

  const containerStyle =
    widthProp != null
      ? ({ width: widthProp, maxWidth: '100%' } as const)
      : undefined;

  const rootClassName = ['histogram', 'article__chart'].join(' ');

  return (
    <div ref={parentRef} className={rootClassName} style={containerStyle}>
      {(title ?? subtitle) && (
        <>
          {title ? (
            <h3 className="article__chartTitle">{title}</h3>
          ) : null}
          {subtitle ? (
            <p className="article__chartSubtitle">{subtitle}</p>
          ) : null}
        </>
      )}
      {width > 10 && data.length > 0 && bins.length > 0 && (
        <>
          <svg width={width} height={height}>
            <Group left={margin.left} top={margin.top}>
              <GridRows
                scale={yScale}
                width={innerWidth}
                stroke={GRID_COLOR}
                strokeDasharray="3 3"
              />
              <GridColumns
                scale={xScale}
                height={innerHeight}
                stroke={GRID_COLOR}
                strokeDasharray="3 3"
              />
              {bins.map((b, i) => {
                const x0 = xScale(b.x0);
                const x1 = xScale(b.x1);
                const barWidth = Math.max(0, x1 - x0 - 1);
                const y = yScale(b.count);
                const barHeight = innerHeight - y;
                return (
                  <Bar
                    key={`${b.x0}-${b.x1}-${i}`}
                    x={x0 + 0.5}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={PRIMARY}
                    stroke={colors.background}
                    strokeWidth={0.5}
                    style={{ cursor: 'default' }}
                    onMouseMove={(e) => {
                      const container = e.currentTarget.closest('.histogram');
                      const svg = e.currentTarget.ownerSVGElement;
                      const point = container
                        ? localPoint(container, e)
                        : svg
                          ? localPoint(svg, e)
                          : localPoint(e);
                      showTooltip({
                        tooltipData: b,
                        tooltipLeft: point?.x ?? 0,
                        tooltipTop: point?.y ?? 0,
                      });
                    }}
                    onMouseLeave={hideTooltip}
                  />
                );
              })}
              <AxisLeft
                scale={yScale}
                hideTicks
                hideAxisLine
                tickFormat={(v) => formatCount(Number(v))}
                tickLabelProps={{
                  fill: AXIS_COLOR,
                  fontSize: 11,
                  textAnchor: 'end',
                  dx: -4,
                }}
              />
              <AxisBottom
                scale={xScale}
                top={innerHeight}
                hideTicks
                hideAxisLine
                tickFormat={(v) => formatAxisNumber(Number(v))}
                tickLabelProps={{
                  fill: AXIS_COLOR,
                  fontSize: 11,
                  textAnchor: 'middle',
                }}
              />
              {xLabel ? (
                <Text
                  x={innerWidth / 2}
                  y={innerHeight + 30}
                  textAnchor="middle"
                  verticalAnchor="start"
                  fill={AXIS_COLOR}
                  fontSize={12}
                >
                  {xLabel}
                </Text>
              ) : null}
              {yLabel ? (
                <Text
                  x={-40}
                  y={innerHeight / 2}
                  textAnchor="middle"
                  verticalAnchor="middle"
                  transform={`rotate(-90, -40, ${innerHeight / 2})`}
                  fill={AXIS_COLOR}
                  fontSize={12}
                >
                  {yLabel}
                </Text>
              ) : null}
            </Group>
          </svg>
          {tooltipOpen && tooltipData && (
            <TooltipWithBounds
              left={tooltipLeft}
              top={tooltipTop}
              style={{
                ...defaultStyles,
                background: colors.background,
                border: `1px solid ${colors.primary}30`,
                borderRadius: 8,
                color: PRIMARY,
                fontSize: 13,
                padding: '8px 12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            >
              <p className="histogram__tooltipMuted">
                Range: {formatAxisNumber(tooltipData.x0)} –{' '}
                {formatAxisNumber(tooltipData.x1)}
              </p>
              <p className="histogram__tooltipLabel">
                Count: {formatCount(tooltipData.count)}
              </p>
            </TooltipWithBounds>
          )}
        </>
      )}
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridColumns } from '@visx/grid';
import { useParentSize } from '@visx/responsive';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { colors } from '@/styles/palette';
import './StackedBarChart.scss';

export type StackedSegment = {
  key: string;
  label: string;
  color: string;
};

export type StackedBarDatum = Record<string, unknown> & { label: string };

type Props = {
  data: StackedBarDatum[];
  segments: StackedSegment[];
  xDomain?: [number, number];
  barSize?: number;
  height?: number;
  legend?: boolean;
};

const MARGIN = { top: 8, right: 40, bottom: 32, left: 120 };
const PRIMARY = colors.primary;
const AXIS_COLOR = colors.primary;
const GRID_COLOR = `${colors.primary}20`;

function formatTickValue(v: number): string {
  return Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function StackedBarChart({
  data,
  segments,
  xDomain,
  barSize = 20,
  height = 500,
  legend = false,
}: Props) {
  const { parentRef, width } = useParentSize();

  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  const computedDomain = useMemo<[number, number]>(() => {
    if (xDomain) return xDomain;
    const totals = data.map((d) =>
      segments.reduce((sum, s) => sum + ((d[s.key] as number) ?? 0), 0),
    );
    return [0, Math.max(...totals) * 1.05];
  }, [data, segments, xDomain]);

  const xScale = useMemo(
    () =>
      scaleLinear({
        domain: computedDomain,
        range: [0, innerWidth],
        nice: !xDomain,
      }),
    [computedDomain, innerWidth, xDomain],
  );

  const yScale = useMemo(
    () =>
      scaleBand({
        domain: data.map((d) => d.label),
        range: [0, innerHeight],
        padding: 0.35,
      }),
    [data, innerHeight],
  );

  const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop, tooltipOpen } =
    useTooltip<StackedBarDatum>();

  return (
    <div ref={parentRef} className="stackedBarChart">
      {width > 10 && (
        <>
          {legend && (
            <div className="stackedBarChart__legend">
              {segments
                .filter((s) => s.color !== 'transparent')
                .map((s) => (
                  <span key={s.key} className="stackedBarChart__legendItem">
                    <span
                      className="stackedBarChart__legendSwatch"
                      style={{ background: s.color }}
                    />
                    {s.label}
                  </span>
                ))}
            </div>
          )}
          <svg width={width} height={height}>
            <Group left={MARGIN.left} top={MARGIN.top}>
              <GridColumns
                scale={xScale}
                height={innerHeight}
                stroke={GRID_COLOR}
                strokeDasharray="3 3"
              />
              {data.map((d) => {
                const barY = yScale(d.label) ?? 0;
                const bh = yScale.bandwidth();
                let cumulative = 0;
                return (
                  <Group
                    key={d.label}
                    onMouseMove={(e) => {
                      const point = localPoint(e) ?? { x: 0, y: 0 };
                      showTooltip({
                        tooltipData: d,
                        tooltipLeft: point.x + MARGIN.left,
                        tooltipTop: point.y + MARGIN.top,
                      });
                    }}
                    onMouseLeave={hideTooltip}
                  >
                    {segments.map((seg) => {
                      const segValue = (d[seg.key] as number) ?? 0;
                      const x = xScale(cumulative);
                      const segWidth = xScale(cumulative + segValue) - xScale(cumulative);
                      cumulative += segValue;

                      if (seg.color === 'transparent' || segWidth <= 0) return null;

                      const isLast = seg === segments[segments.length - 1];
                      return (
                        <Bar
                          key={seg.key}
                          x={x}
                          y={barY + (bh - barSize) / 2}
                          width={segWidth}
                          height={barSize}
                          fill={seg.color}
                          rx={isLast ? 4 : 0}
                        />
                      );
                    })}
                  </Group>
                );
              })}
              <AxisLeft
                scale={yScale}
                hideTicks
                hideAxisLine
                numTicks={data.length}
                tickLabelProps={{ fill: AXIS_COLOR, fontSize: 12, textAnchor: 'end', dy: '0.33em' }}
              />
              <AxisBottom
                scale={xScale}
                top={innerHeight}
                hideTicks
                hideAxisLine
                tickFormat={(v) => formatTickValue(Number(v))}
                tickLabelProps={{ fill: AXIS_COLOR, fontSize: 11, textAnchor: 'middle' }}
              />
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
              <p className="stackedBarChart__tooltipLabel">{tooltipData.label}</p>
              {segments
                .filter((s) => s.color !== 'transparent')
                .map((s) => (
                  <p key={s.key} className="stackedBarChart__tooltipSegment">
                    <span
                      className="stackedBarChart__tooltipSwatch"
                      style={{ background: s.color }}
                    />
                    {s.label}: {(tooltipData[s.key] as number)?.toLocaleString()}
                  </p>
                ))}
            </TooltipWithBounds>
          )}
        </>
      )}
    </div>
  );
}

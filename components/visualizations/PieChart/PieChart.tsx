'use client';

import { useMemo } from 'react';
import { Group } from '@visx/group';
import { Pie } from '@visx/shape';
import { useParentSize } from '@visx/responsive';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { Legend } from '@/components/article';
import { chartPalette, colors } from '@/styles/palette';
import './PieChart.scss';

export type PieDatum = {
  label: string;
  value: number;
  color?: string;
};

type Props = {
  data: PieDatum[];
  title?: string;
  subtitle?: string;
  height?: number;
  width?: number;
  /** Outer radius in pixels; when omitted, derived from container size. */
  outerRadius?: number;
  /** Set > 0 for a donut (e.g. 0.55 × outer radius). */
  innerRadius?: number;
  /** Radial gap between slices (radians). */
  padAngle?: number;
  showLegend?: boolean;
  /** Applies `article__chart--contained` max-width when true. */
  contained?: boolean;
};

const PRIMARY = colors.primary;

function formatValue(v: number): string {
  return Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatPercent(fraction: number): string {
  return `${(fraction * 100).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`;
}

export function PieChart({
  data,
  title,
  subtitle,
  height = 360,
  width: widthProp,
  outerRadius: outerRadiusProp,
  innerRadius: innerRadiusProp,
  padAngle = 0.015,
  showLegend = true,
  contained = false,
}: Props) {
  const { parentRef, width } = useParentSize();

  const slices = useMemo(
    () => data.filter((d) => Number.isFinite(d.value) && d.value > 0),
    [data]
  );

  const total = useMemo(
    () => slices.reduce((sum, d) => sum + d.value, 0),
    [slices]
  );

  const colorForIndex = useMemo(() => {
    return (i: number, d: PieDatum) =>
      d.color ?? chartPalette[i % chartPalette.length];
  }, []);

  const legendItems = useMemo(
    () =>
      slices.map((d, i) => ({
        label: d.label,
        color: colorForIndex(i, d),
      })),
    [slices, colorForIndex]
  );

  const outerRadius = useMemo(() => {
    if (outerRadiusProp != null) return outerRadiusProp;
    const size = Math.min(width, height);
    return Math.max(0, size / 2 - 8);
  }, [outerRadiusProp, width, height]);

  const innerRadius = useMemo(() => {
    if (innerRadiusProp == null) return 0;
    return Math.min(innerRadiusProp, outerRadius - 1);
  }, [innerRadiusProp, outerRadius]);

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = useTooltip<{ datum: PieDatum; fraction: number }>();

  const containerStyle =
    widthProp != null
      ? ({ width: widthProp, maxWidth: '100%' } as const)
      : undefined;

  const rootClassName = [
    'pieChart',
    'article__chart',
    contained ? 'article__chart--contained' : '',
  ]
    .filter(Boolean)
    .join(' ');

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
      {width > 10 && slices.length > 0 && total > 0 && (
        <>
          <svg width={width} height={height} className="pieChart__svg">
            <Group left={width / 2} top={height / 2}>
              <Pie
                data={slices}
                pieValue={(d) => d.value}
                outerRadius={outerRadius}
                innerRadius={innerRadius}
                padAngle={padAngle}
                pieSort={null}
                pieSortValues={null}
              >
                {({ arcs, path }) =>
                  arcs.map((arc, i) => {
                    const d = arc.data;
                    const fill = colorForIndex(i, d);
                    const fraction = arc.value / total;
                    return (
                      <path
                        key={`${d.label}-${i}`}
                        d={path(arc) ?? ''}
                        fill={fill}
                        stroke={colors.background}
                        strokeWidth={1}
                        style={{ cursor: 'default' }}
                        onMouseMove={(e) => {
                          const container = e.currentTarget.closest('.pieChart');
                          const svg = e.currentTarget.ownerSVGElement;
                          const point = container
                            ? localPoint(container, e)
                            : svg
                              ? localPoint(svg, e)
                              : localPoint(e);
                          showTooltip({
                            tooltipData: {
                              datum: d,
                              fraction,
                            },
                            tooltipLeft: point?.x ?? 0,
                            tooltipTop: point?.y ?? 0,
                          });
                        }}
                        onMouseLeave={hideTooltip}
                      />
                    );
                  })
                }
              </Pie>
            </Group>
          </svg>
          {showLegend && legendItems.length > 0 ? (
            <Legend items={legendItems} />
          ) : null}
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
              <p className="pieChart__tooltipLabel">{tooltipData.datum.label}</p>
              <p className="pieChart__tooltipMuted">
                {formatValue(tooltipData.datum.value)} (
                {formatPercent(tooltipData.fraction)})
              </p>
            </TooltipWithBounds>
          )}
        </>
      )}
    </div>
  );
}

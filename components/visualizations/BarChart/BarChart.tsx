'use client';

import { useMemo } from 'react';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridColumns, GridRows } from '@visx/grid';
import { useParentSize } from '@visx/responsive';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { Text } from '@visx/text';
import { Legend } from '@/components/article';
import { chartPalette, colors } from '@/styles/palette';
import './BarChart.scss';

export type BarDatum = {
  label: string;
  value: number;
  group?: string;
  color?: string;
  meta?: Record<string, unknown>;
};

type LegendItem = { label: string; color: string };

type Props = {
  data: BarDatum[];
  title?: string;
  subtitle?: string;
  defaultColor?: string;
  barSize?: number;
  /** Pixel height of the SVG chart area. */
  height?: number;
  /** Optional fixed width for the chart container (responsive up to this size). */
  width?: number;
  orientation?: 'horizontal' | 'vertical';
  /** Applies `article__chart--contained` max-width when true. */
  contained?: boolean;
};

const PRIMARY = colors.primary;
const AXIS_COLOR = colors.primary;
const GRID_COLOR = `${colors.primary}20`;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function wrapAtWordBoundaries(label: string, maxCharsPerLine: number): string {
  const normalized = label.trim().replace(/\s+/g, ' ');
  if (normalized.length <= maxCharsPerLine) return normalized;

  const words = normalized.split(' ');
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    if (line.length === 0) {
      line = word;
      continue;
    }

    const candidate = `${line} ${word}`;
    if (candidate.length <= maxCharsPerLine) {
      line = candidate;
      continue;
    }

    lines.push(line);
    line = word;
  }

  if (line.length > 0) lines.push(line);
  return lines.join('\n');
}

function formatTickValue(v: number): string {
  return Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

const Y_TICK_MAX_CHARS_PER_LINE = 20;

export function BarChart({
  data,
  title,
  subtitle,
  defaultColor = PRIMARY,
  barSize = 20,
  height: heightProp = 500,
  width: widthProp,
  orientation = 'horizontal',
  contained = false,
}: Props) {
  const { parentRef, width } = useParentSize();

  const groupDomain = useMemo(() => {
    const groups = data
      .map((d) => d.group)
      .filter((g): g is string => typeof g === 'string' && g.length > 0);
    return [...new Set(groups)];
  }, [data]);

  const groupColorByLabel = useMemo(() => {
    const map = new Map<string, string>();
    groupDomain.forEach((g, i) => {
      map.set(g, chartPalette[i % chartPalette.length]);
    });
    return map;
  }, [groupDomain]);

  const derivedLegendItems: LegendItem[] | null = useMemo(() => {
    if (groupDomain.length === 0) return null;
    return groupDomain.map((g) => ({
      label: g,
      color: groupColorByLabel.get(g) ?? PRIMARY,
    }));
  }, [groupDomain, groupColorByLabel]);

  const barFill = (d: BarDatum): string => {
    if (d.group != null && typeof d.group === 'string' && d.group.length > 0) {
      return groupColorByLabel.get(d.group) ?? d.color ?? defaultColor;
    }
    return d.color ?? defaultColor;
  };

  const maxLabelLength = useMemo(() => {
    if (data.length === 0) return 0;
    return Math.max(...data.map((d) => d.label.length));
  }, [data]);

  const margin = useMemo(
    () =>
      orientation === 'horizontal'
        ? {
            top: 8,
            right: 40,
            bottom: 32,
            left: clamp(
              72 + Math.min(maxLabelLength, Y_TICK_MAX_CHARS_PER_LINE) * 6.8,
              132,
              240,
            ),
          }
        : { top: 8, right: 40, bottom: 76, left: 56 },
    [orientation, maxLabelLength]
  );

  const yTickMaxCharsPerLine = Y_TICK_MAX_CHARS_PER_LINE;

  const effectiveHeight = useMemo(() => {
    if (orientation !== 'horizontal' || data.length === 0) return heightProp;

    // Match the actual 20-char word-wrapping used in tick rendering.
    const fontSize = 12;
    const lineHeightPx = fontSize * 1.15;
    const maxLines = Math.max(
      1,
      ...data.map(
        (d) =>
          wrapAtWordBoundaries(d.label, yTickMaxCharsPerLine).split('\n').length
      )
    );

    const minRowHeight = Math.max(barSize, Math.ceil(maxLines * lineHeightPx));
    const innerMinHeight = data.length * (minRowHeight + 10);
    const minHeight = innerMinHeight + margin.top + margin.bottom;

    return Math.max(heightProp, minHeight);
  }, [
    orientation,
    data,
    heightProp,
    barSize,
    margin.top,
    margin.bottom,
    yTickMaxCharsPerLine,
  ]);

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = effectiveHeight - margin.top - margin.bottom;
  const maxValue = data.length > 0 ? Math.max(...data.map((d) => d.value)) : 0;

  const horizontalBandScale = useMemo(
    () =>
      scaleBand({
        domain: data.map((d) => d.label),
        range: [0, innerHeight],
        padding: 0.35,
      }),
    [data, innerHeight]
  );

  const horizontalLinearScale = useMemo(
    () =>
      scaleLinear({
        domain: [0, maxValue * 1.05],
        range: [0, innerWidth],
        nice: true,
      }),
    [innerWidth, maxValue]
  );

  const verticalBandScale = useMemo(
    () =>
      scaleBand({
        domain: data.map((d) => d.label),
        range: [0, innerWidth],
        padding: 0.35,
      }),
    [data, innerWidth]
  );

  const verticalLinearScale = useMemo(
    () =>
      scaleLinear({
        domain: [0, maxValue * 1.05],
        range: [innerHeight, 0],
        nice: true,
      }),
    [innerHeight, maxValue]
  );

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = useTooltip<BarDatum>();

  const containerStyle =
    widthProp != null
      ? ({ width: widthProp, maxWidth: '100%' } as const)
      : undefined;

  const rootClassName = [
    'barChart',
    contained ? 'article__chart article__chart--contained' : 'article__chart',
  ].join(' ');

  return (
    <div ref={parentRef} className={rootClassName} style={containerStyle}>
      {(title ?? subtitle) && (
        <>
          {title ? <h3 className="article__chartTitle">{title}</h3> : null}
          {subtitle ? (
            <p className="article__chartSubtitle">{subtitle}</p>
          ) : null}
        </>
      )}
      {derivedLegendItems && derivedLegendItems.length > 0 ? (
        <Legend items={derivedLegendItems} />
      ) : null}
      {width > 10 && (
        <>
          <svg width={width} height={effectiveHeight}>
            <Group left={margin.left} top={margin.top}>
              {orientation === 'horizontal' ? (
                <>
                  <GridColumns
                    scale={horizontalLinearScale}
                    height={innerHeight}
                    stroke={GRID_COLOR}
                    strokeDasharray="3 3"
                  />
                  {data.map((d) => {
                    const barWidth = horizontalLinearScale(d.value);
                    const barY = horizontalBandScale(d.label) ?? 0;
                    const bandHeight = horizontalBandScale.bandwidth();
                    const clampedBarSize = Math.min(barSize, bandHeight);
                    return (
                      <Bar
                        key={d.label}
                        x={0}
                        y={barY + (bandHeight - clampedBarSize) / 2}
                        width={barWidth}
                        height={clampedBarSize}
                        fill={barFill(d)}
                        rx={4}
                        onMouseMove={(e) => {
                          const svg = e.currentTarget.ownerSVGElement;
                          const point = svg
                            ? localPoint(svg, e)
                            : localPoint(e);
                          showTooltip({
                            tooltipData: d,
                            tooltipLeft: point?.x ?? 0,
                            tooltipTop: point?.y ?? 0,
                          });
                        }}
                        onMouseLeave={hideTooltip}
                      />
                    );
                  })}
                  <AxisLeft
                    scale={horizontalBandScale}
                    hideTicks
                    hideAxisLine
                    numTicks={data.length}
                    tickLabelProps={{ fill: AXIS_COLOR, fontSize: 12 }}
                    tickComponent={({ formattedValue, x, y, dx, dy }) => {
                      const fontSize = 12;
                      const lineHeightPx = fontSize * 1.15;
                      const text = wrapAtWordBoundaries(
                        formattedValue ?? '',
                        yTickMaxCharsPerLine,
                      );
                      const lines = text.split('\n');
                      const startDy =
                        -((Math.max(1, lines.length) - 1) * lineHeightPx) / 2;

                      const xPos =
                        (x ?? 0) + (typeof dx === 'number' ? dx : -8);
                      const yPos =
                        (y ?? 0) + (typeof dy === 'number' ? dy : 0);

                      return (
                        <text
                          className="barChart__axisTickLabel"
                          x={xPos}
                          y={yPos}
                          textAnchor="end"
                          dominantBaseline="middle"
                          fill={AXIS_COLOR}
                          fontSize={fontSize}
                        >
                          {lines.map((line, idx) => (
                            <tspan
                              key={idx}
                              x={xPos}
                              dy={idx === 0 ? startDy : lineHeightPx}
                            >
                              {line}
                            </tspan>
                          ))}
                        </text>
                      );
                    }}
                  />
                  <AxisBottom
                    scale={horizontalLinearScale}
                    top={innerHeight}
                    hideTicks
                    hideAxisLine
                    tickFormat={(v) => formatTickValue(Number(v))}
                    tickLabelProps={{
                      fill: AXIS_COLOR,
                      fontSize: 11,
                      textAnchor: 'middle',
                    }}
                  />
                </>
              ) : (
                <>
                  <GridRows
                    scale={verticalLinearScale}
                    width={innerWidth}
                    stroke={GRID_COLOR}
                    strokeDasharray="3 3"
                  />
                  {data.map((d) => {
                    const barX = verticalBandScale(d.label) ?? 0;
                    const bandWidth = verticalBandScale.bandwidth();
                    const clampedBarSize = Math.min(barSize, bandWidth);
                    const centeredBarX =
                      barX + (bandWidth - clampedBarSize) / 2;
                    const barY = verticalLinearScale(d.value);
                    const barHeight = innerHeight - barY;
                    return (
                      <Bar
                        key={d.label}
                        x={centeredBarX}
                        y={barY}
                        width={clampedBarSize}
                        height={barHeight}
                        fill={barFill(d)}
                        rx={4}
                        onMouseMove={(e) => {
                          const svg = e.currentTarget.ownerSVGElement;
                          const point = svg
                            ? localPoint(svg, e)
                            : localPoint(e);
                          showTooltip({
                            tooltipData: d,
                            tooltipLeft: point?.x ?? 0,
                            tooltipTop: point?.y ?? 0,
                          });
                        }}
                        onMouseLeave={hideTooltip}
                      />
                    );
                  })}
                  <AxisLeft
                    scale={verticalLinearScale}
                    hideTicks
                    hideAxisLine
                    tickFormat={(v) => formatTickValue(Number(v))}
                    tickLabelProps={{
                      fill: AXIS_COLOR,
                      fontSize: 11,
                      textAnchor: 'end',
                      dy: '0.33em',
                    }}
                  />
                  <AxisBottom
                    scale={verticalBandScale}
                    top={innerHeight}
                    hideTicks
                    hideAxisLine
                    numTicks={data.length}
                    tickLabelProps={{ fill: AXIS_COLOR, fontSize: 11 }}
                    tickComponent={({ formattedValue, x, y, dx, dy }) => {
                      const labelWidth = Math.max(
                        24,
                        verticalBandScale.bandwidth() - 6
                      );
                      return (
                        <Text
                          className="barChart__axisTickLabel"
                          x={x}
                          y={y}
                          dx={dx}
                          dy={dy}
                          width={labelWidth}
                          textAnchor="middle"
                          verticalAnchor="start"
                          fill={AXIS_COLOR}
                          fontSize={11}
                          lineHeight="1.15em"
                        >
                          {formattedValue ?? ''}
                        </Text>
                      );
                    }}
                  />
                </>
              )}
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
              <p className="barChart__tooltipLabel">{tooltipData.label}</p>
              <p>{formatTickValue(tooltipData.value)}</p>
            </TooltipWithBounds>
          )}
        </>
      )}
    </div>
  );
}

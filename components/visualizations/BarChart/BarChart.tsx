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
import { chartPalette } from '@/styles/palette';
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
  /** Pixel height of the SVG chart area. Auto-sized when data has groups so each row stays readable. */
  height?: number;
  width?: number;
  orientation?: 'horizontal' | 'vertical';
  contained?: boolean;
};

const PRIMARY = '#501315';
const AXIS_COLOR = '#501315';
const GRID_COLOR = '#50131520';

function formatTickValue(v: number): string {
  return Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function BarChart({
  data,
  title,
  subtitle,
  defaultColor = PRIMARY,
  barSize = 20,
  height: heightProp,
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

  const isGrouped = groupDomain.length > 0;

  const labelDomain = useMemo(() => [...new Set(data.map((d) => d.label))], [data]);

  // Auto-size height for horizontal grouped charts so every bar gets enough room.
  const height = useMemo(() => {
    if (heightProp != null) return heightProp;
    if (orientation === 'horizontal') {
      const perRow = isGrouped ? groupDomain.length * 22 + 20 : 36;
      return Math.max(320, labelDomain.length * perRow + 60);
    }
    return 480;
  }, [heightProp, orientation, isGrouped, groupDomain.length, labelDomain.length]);

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

  const margin = useMemo(
    () =>
      orientation === 'horizontal'
        ? { top: 8, right: 40, bottom: 32, left: 156 }
        : { top: 8, right: 40, bottom: 92, left: 56 },
    [orientation],
  );

  const leftCategoryLabelWidth = Math.max(56, margin.left - 20);

  const innerWidth = Math.max(0, width - margin.left - margin.right);
  const innerHeight = Math.max(0, height - margin.top - margin.bottom);
  const maxValue = data.length > 0 ? Math.max(...data.map((d) => d.value)) : 0;

  // Outer band (institutions) — uses unique labels so duplicates don't collide.
  const horizontalOuterBand = useMemo(
    () =>
      scaleBand({
        domain: labelDomain,
        range: [0, innerHeight],
        padding: isGrouped ? 0.18 : 0.35,
      }),
    [labelDomain, innerHeight, isGrouped],
  );

  // Inner band (groups within an institution).
  const horizontalInnerBand = useMemo(
    () =>
      scaleBand({
        domain: isGrouped ? groupDomain : ['_'],
        range: [0, horizontalOuterBand.bandwidth()],
        padding: isGrouped ? 0.18 : 0,
      }),
    [groupDomain, horizontalOuterBand, isGrouped],
  );

  const horizontalLinearScale = useMemo(
    () =>
      scaleLinear({
        domain: [0, maxValue * 1.05],
        range: [0, innerWidth],
        nice: true,
      }),
    [innerWidth, maxValue],
  );

  const verticalOuterBand = useMemo(
    () =>
      scaleBand({
        domain: labelDomain,
        range: [0, innerWidth],
        padding: isGrouped ? 0.18 : 0.35,
      }),
    [labelDomain, innerWidth, isGrouped],
  );

  const verticalInnerBand = useMemo(
    () =>
      scaleBand({
        domain: isGrouped ? groupDomain : ['_'],
        range: [0, verticalOuterBand.bandwidth()],
        padding: isGrouped ? 0.18 : 0,
      }),
    [groupDomain, verticalOuterBand, isGrouped],
  );

  const verticalLinearScale = useMemo(
    () =>
      scaleLinear({
        domain: [0, maxValue * 1.05],
        range: [innerHeight, 0],
        nice: true,
      }),
    [innerHeight, maxValue],
  );

  const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop, tooltipOpen } =
    useTooltip<BarDatum>();

  const containerStyle =
    widthProp != null ? ({ width: widthProp, maxWidth: '100%' } as const) : undefined;

  const rootClassName = [
    'barChart',
    contained ? 'article__chart article__chart--contained' : 'article__chart',
  ].join(' ');

  return (
    <div ref={parentRef} className={rootClassName} style={containerStyle}>
      {(title ?? subtitle) && (
        <>
          {title ? <h3 className="article__chartTitle">{title}</h3> : null}
          {subtitle ? <p className="article__chartSubtitle">{subtitle}</p> : null}
        </>
      )}
      {derivedLegendItems && derivedLegendItems.length > 0 ? (
        <Legend items={derivedLegendItems} />
      ) : null}
      {width > 10 && (
        <>
          <svg width={width} height={height}>
            <Group left={margin.left} top={margin.top}>
              {orientation === 'horizontal' ? (
                <>
                  <GridColumns
                    scale={horizontalLinearScale}
                    height={innerHeight}
                    stroke={GRID_COLOR}
                    strokeDasharray="3 3"
                  />
                  {data.map((d, i) => {
                    const outerY = horizontalOuterBand(d.label);
                    if (outerY == null) return null;
                    const innerKey = isGrouped ? (d.group as string) : '_';
                    const innerY = horizontalInnerBand(innerKey);
                    if (innerY == null) return null;
                    const bandHeight = horizontalInnerBand.bandwidth();
                    const clampedBarSize = Math.min(barSize, bandHeight);
                    const barWidth = horizontalLinearScale(d.value);
                    return (
                      <Bar
                        key={`${d.label}__${innerKey}__${i}`}
                        x={0}
                        y={outerY + innerY + (bandHeight - clampedBarSize) / 2}
                        width={barWidth}
                        height={clampedBarSize}
                        fill={barFill(d)}
                        rx={4}
                        onMouseMove={(e) => {
                          const svg = e.currentTarget.ownerSVGElement;
                          const point = svg ? localPoint(svg, e) : localPoint(e);
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
                    scale={horizontalOuterBand}
                    hideTicks
                    hideAxisLine
                    numTicks={labelDomain.length}
                    tickLabelProps={{ fill: AXIS_COLOR, fontSize: 12 }}
                    tickComponent={({ formattedValue, x, y, dx, dy }) => (
                      <Text
                        className="barChart__axisTickLabel"
                        x={x}
                        y={y}
                        dx={dx}
                        dy={dy}
                        width={leftCategoryLabelWidth}
                        textAnchor="end"
                        verticalAnchor="middle"
                        fill={AXIS_COLOR}
                        fontSize={12}
                        lineHeight="1.15em"
                      >
                        {formattedValue ?? ''}
                      </Text>
                    )}
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
                  {data.map((d, i) => {
                    const outerX = verticalOuterBand(d.label);
                    if (outerX == null) return null;
                    const innerKey = isGrouped ? (d.group as string) : '_';
                    const innerX = verticalInnerBand(innerKey);
                    if (innerX == null) return null;
                    const bandWidth = verticalInnerBand.bandwidth();
                    const clampedBarSize = Math.min(barSize, bandWidth);
                    const barX = outerX + innerX + (bandWidth - clampedBarSize) / 2;
                    const barY = verticalLinearScale(d.value);
                    const barHeight = innerHeight - barY;
                    return (
                      <Bar
                        key={`${d.label}__${innerKey}__${i}`}
                        x={barX}
                        y={barY}
                        width={clampedBarSize}
                        height={barHeight}
                        fill={barFill(d)}
                        rx={4}
                        onMouseMove={(e) => {
                          const svg = e.currentTarget.ownerSVGElement;
                          const point = svg ? localPoint(svg, e) : localPoint(e);
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
                    scale={verticalOuterBand}
                    top={innerHeight}
                    hideTicks
                    hideAxisLine
                    numTicks={labelDomain.length}
                    tickLabelProps={{ fill: AXIS_COLOR, fontSize: 11 }}
                    tickComponent={({ formattedValue, x, y, dx, dy }) => {
                      const labelWidth = Math.max(24, verticalOuterBand.bandwidth() - 6);
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
                background: '#FFFCF7',
                border: '1px solid #50131530',
                borderRadius: 8,
                color: PRIMARY,
                fontSize: 13,
                padding: '8px 12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            >
              <p className="barChart__tooltipLabel">
                {tooltipData.label}
                {tooltipData.group ? ` · ${tooltipData.group}` : ''}
              </p>
              <p>{formatTickValue(tooltipData.value)}</p>
            </TooltipWithBounds>
          )}
        </>
      )}
    </div>
  );
}

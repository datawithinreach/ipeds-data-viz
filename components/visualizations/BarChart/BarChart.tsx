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
import type { ReactNode } from 'react';
import './BarChart.scss';

export type BarDatum = {
  label: string;
  value: number;
  group?: string;
  color?: string;
  meta?: Record<string, unknown>;
};

type Props = {
  data: BarDatum[];
  formatValue?: (v: number) => string;
  formatTick?: (v: number) => string;
  defaultColor?: string;
  barSize?: number;
  height?: number;
  orientation?: 'horizontal' | 'vertical';
  renderTooltip?: (datum: BarDatum) => ReactNode;
};

const MARGIN = { top: 8, right: 40, bottom: 32, left: 120 };
const PRIMARY = '#501315';
const AXIS_COLOR = '#501315';
const GRID_COLOR = '#50131520';

export function BarChart({
  data,
  formatValue,
  formatTick,
  defaultColor = PRIMARY,
  barSize = 20,
  height = 500,
  orientation = 'horizontal',
  renderTooltip,
}: Props) {
  const { parentRef, width } = useParentSize();

  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;
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

  return (
    <div ref={parentRef} className="barChart">
      {width > 10 && (
        <>
          <svg width={width} height={height}>
            <Group left={MARGIN.left} top={MARGIN.top}>
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
                        fill={d.color ?? defaultColor}
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
                    scale={horizontalBandScale}
                    hideTicks
                    hideAxisLine
                    numTicks={data.length}
                    tickLabelProps={{
                      fill: AXIS_COLOR,
                      fontSize: 12,
                      textAnchor: 'end',
                      dy: '0.33em',
                    }}
                  />
                  <AxisBottom
                    scale={horizontalLinearScale}
                    top={innerHeight}
                    hideTicks
                    hideAxisLine
                    tickFormat={
                      formatTick
                        ? (v) => formatTick(Number(v))
                        : (v) => String(v)
                    }
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
                        fill={d.color ?? defaultColor}
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
                    tickFormat={
                      formatTick
                        ? (v) => formatTick(Number(v))
                        : (v) => String(v)
                    }
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
                    tickLabelProps={{
                      fill: AXIS_COLOR,
                      fontSize: 11,
                      textAnchor: 'middle',
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
              {renderTooltip ? (
                renderTooltip(tooltipData)
              ) : (
                <>
                  <p className="barChart__tooltipLabel">{tooltipData.label}</p>
                  <p>
                    {formatValue
                      ? formatValue(tooltipData.value)
                      : tooltipData.value}
                  </p>
                </>
              )}
            </TooltipWithBounds>
          )}
        </>
      )}
    </div>
  );
}

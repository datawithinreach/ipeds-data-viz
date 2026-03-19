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

export type BarDatum = {
  label: string;
  value: number;
  color?: string;
};

type Props = {
  data: BarDatum[];
  formatValue?: (v: number) => string;
  formatTick?: (v: number) => string;
  defaultColor?: string;
  barSize?: number;
  height?: number;
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
}: Props) {
  const { parentRef, width } = useParentSize();

  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  const yScale = useMemo(
    () =>
      scaleBand({
        domain: data.map((d) => d.label),
        range: [0, innerHeight],
        padding: 0.35,
      }),
    [data, innerHeight],
  );

  const xScale = useMemo(
    () =>
      scaleLinear({
        domain: [0, Math.max(...data.map((d) => d.value)) * 1.05],
        range: [0, innerWidth],
        nice: true,
      }),
    [data, innerWidth],
  );

  const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop, tooltipOpen } =
    useTooltip<BarDatum>();

  return (
    <div ref={parentRef} className="relative w-full">
      {width > 10 && (
        <>
          <svg width={width} height={height}>
            <Group left={MARGIN.left} top={MARGIN.top}>
              <GridColumns
                scale={xScale}
                height={innerHeight}
                stroke={GRID_COLOR}
                strokeDasharray="3 3"
              />
              {data.map((d) => {
                const barWidth = xScale(d.value);
                const barY = yScale(d.label) ?? 0;
                const bh = yScale.bandwidth();
                return (
                  <Bar
                    key={d.label}
                    x={0}
                    y={barY + (bh - barSize) / 2}
                    width={barWidth}
                    height={barSize}
                    fill={d.color ?? defaultColor}
                    rx={4}
                    onMouseMove={(e) => {
                      const point = localPoint(e) ?? { x: 0, y: 0 };
                      showTooltip({
                        tooltipData: d,
                        tooltipLeft: point.x + MARGIN.left,
                        tooltipTop: point.y + MARGIN.top,
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
                tickLabelProps={{ fill: AXIS_COLOR, fontSize: 12, textAnchor: 'end', dy: '0.33em' }}
              />
              <AxisBottom
                scale={xScale}
                top={innerHeight}
                hideTicks
                hideAxisLine
                tickFormat={formatTick ? (v) => formatTick(Number(v)) : (v) => String(v)}
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
                background: '#FFFCF7',
                border: '1px solid #50131530',
                borderRadius: 8,
                color: PRIMARY,
                fontSize: 13,
                padding: '8px 12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            >
              <p className="font-semibold">{tooltipData.label}</p>
              <p>{formatValue ? formatValue(tooltipData.value) : tooltipData.value}</p>
            </TooltipWithBounds>
          )}
        </>
      )}
    </div>
  );
}

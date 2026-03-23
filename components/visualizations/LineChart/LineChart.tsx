'use client';

import { useMemo, useState } from 'react';
import { scaleLinear, scalePoint } from '@visx/scale';
import { Group } from '@visx/group';
import { LinePath } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { useParentSize } from '@visx/responsive';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import './LineChart.scss';

export type LineSeries = {
  key: string;
  label?: string;
  color: string;
  data: { x: string; y: number }[];
};

type Props = {
  series: LineSeries[];
  formatValue?: (v: number) => string;
  formatTick?: (v: number) => string;
  height?: number;
  showLegend?: boolean;
  enableSeriesSelection?: boolean;
};

const MARGIN = { top: 16, right: 24, bottom: 36, left: 56 };
const PRIMARY = '#501315';
const AXIS_COLOR = '#501315';
const GRID_COLOR = '#50131515';

type TooltipDatum = {
  seriesLabel: string;
  x: string;
  y: number;
  color: string;
};

export function LineChart({
  series,
  formatValue,
  formatTick,
  height = 360,
  showLegend = true,
  enableSeriesSelection = false,
}: Props) {
  const { parentRef, width } = useParentSize();
  const [selectedKeys, setSelectedKeys] = useState<string[]>(() =>
    series.map((item) => item.key)
  );

  const visibleSeries = useMemo(() => {
    if (!enableSeriesSelection) return series;
    const selected = series.filter((item) => selectedKeys.includes(item.key));
    return selected.length > 0 ? selected : series;
  }, [enableSeriesSelection, selectedKeys, series]);

  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  const allXValues = useMemo(
    () => [...new Set(visibleSeries.flatMap((s) => s.data.map((d) => d.x)))],
    [visibleSeries]
  );

  const allYValues = useMemo(
    () => visibleSeries.flatMap((s) => s.data.map((d) => d.y)),
    [visibleSeries]
  );

  const xScale = useMemo(
    () =>
      scalePoint({
        domain: allXValues,
        range: [0, innerWidth],
        padding: 0.1,
      }),
    [allXValues, innerWidth]
  );

  const yMin = Math.min(...allYValues);
  const yMax = Math.max(...allYValues);
  const yPad = (yMax - yMin) * 0.1;

  const yScale = useMemo(
    () =>
      scaleLinear({
        domain: [yMin - yPad, yMax + yPad],
        range: [innerHeight, 0],
        nice: true,
      }),
    [yMin, yMax, yPad, innerHeight]
  );

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = useTooltip<TooltipDatum>();

  return (
    <div ref={parentRef} className="lineChart">
      {width > 10 && (
        <>
          {showLegend && series.length > 1 && (
            <div className="lineChart__legend">
              {series.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  className="lineChart__legendItem"
                  data-active={
                    !enableSeriesSelection || selectedKeys.includes(s.key)
                  }
                  onClick={() => {
                    if (!enableSeriesSelection) return;
                    setSelectedKeys((previous) => {
                      if (previous.includes(s.key)) {
                        // Keep at least one active line visible.
                        if (previous.length === 1) return previous;
                        return previous.filter((key) => key !== s.key);
                      }
                      return [...previous, s.key];
                    });
                  }}
                >
                  <span
                    className="lineChart__legendSwatch"
                    style={{ background: s.color }}
                  />
                  {s.label ?? s.key}
                </button>
              ))}
            </div>
          )}
          <svg width={width} height={height}>
            <Group left={MARGIN.left} top={MARGIN.top}>
              <GridRows
                scale={yScale}
                width={innerWidth}
                stroke={GRID_COLOR}
                strokeDasharray="3 3"
              />
              {visibleSeries.map((s) => (
                <LinePath
                  key={s.key}
                  data={s.data}
                  x={(d) => xScale(d.x) ?? 0}
                  y={(d) => yScale(d.y)}
                  stroke={s.color}
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              ))}
              {visibleSeries.map((s) =>
                s.data.map((d) => (
                  <circle
                    key={`${s.key}-${d.x}`}
                    cx={xScale(d.x) ?? 0}
                    cy={yScale(d.y)}
                    r={4}
                    fill={s.color}
                    onMouseMove={(e) => {
                      const container = e.currentTarget.closest('.lineChart');
                      const svg = e.currentTarget.ownerSVGElement;
                      const point = container
                        ? localPoint(container, e)
                        : svg
                          ? localPoint(svg, e)
                          : localPoint(e);
                      showTooltip({
                        tooltipData: {
                          seriesLabel: s.label ?? s.key,
                          x: d.x,
                          y: d.y,
                          color: s.color,
                        },
                        tooltipLeft: point?.x ?? 0,
                        tooltipTop: point?.y ?? 0,
                      });
                    }}
                    onMouseLeave={hideTooltip}
                  />
                ))
              )}
              <AxisLeft
                scale={yScale}
                hideTicks
                hideAxisLine
                tickFormat={
                  formatTick ? (v) => formatTick(Number(v)) : (v) => String(v)
                }
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
                tickLabelProps={{
                  fill: AXIS_COLOR,
                  fontSize: 12,
                  textAnchor: 'middle',
                }}
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
              <p className="lineChart__tooltipLabel">
                {tooltipData.seriesLabel}
              </p>
              <p className="lineChart__tooltipX">{tooltipData.x}</p>
              <p>{formatValue ? formatValue(tooltipData.y) : tooltipData.y}</p>
            </TooltipWithBounds>
          )}
        </>
      )}
    </div>
  );
}

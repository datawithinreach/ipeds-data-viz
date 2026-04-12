'use client';

import { useMemo } from 'react';
import { scaleLinear } from '@visx/scale';
import { Group } from '@visx/group';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows, GridColumns } from '@visx/grid';
import { useParentSize } from '@visx/responsive';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { Text } from '@visx/text';
import { colors } from '@/styles/palette';
import './ScatterPlot.scss';

export type ScatterDatum = {
  x: number;
  y: number;
  /** Shown in the tooltip when set. */
  label?: string;
};

type Props = {
  data: ScatterDatum[];
  title?: string;
  subtitle?: string;
  /** Short axis title rendered under the x scale. */
  xLabel?: string;
  /** Short axis title rendered beside the y scale. */
  yLabel?: string;
  height?: number;
  width?: number;
  pointRadius?: number;
  pointColor?: string;
};

const PRIMARY = colors.primary;
const AXIS_COLOR = colors.primary;
const GRID_COLOR = `${colors.primary}15`;

function formatTickValue(v: number): string {
  return Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function paddedLinearDomain(
  values: number[],
  padRatio = 0.08
): [number, number] {
  if (values.length === 0) return [0, 1];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) {
    const pad = Math.abs(min) * 0.1 || 1;
    return [min - pad, max + pad];
  }
  const span = max - min;
  const pad = span * padRatio;
  return [min - pad, max + pad];
}

export function ScatterPlot({
  data,
  title,
  subtitle,
  xLabel,
  yLabel,
  height = 360,
  width: widthProp,
  pointRadius = 5,
  pointColor = PRIMARY,
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

  const xScale = useMemo(() => {
    const domain = paddedLinearDomain(data.map((d) => d.x));
    return scaleLinear<number>({
      domain,
      range: [0, innerWidth],
      nice: true,
    });
  }, [data, innerWidth]);

  const yScale = useMemo(() => {
    const domain = paddedLinearDomain(data.map((d) => d.y));
    return scaleLinear<number>({
      domain,
      range: [innerHeight, 0],
      nice: true,
    });
  }, [data, innerHeight]);

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = useTooltip<ScatterDatum>();

  const containerStyle =
    widthProp != null
      ? ({ width: widthProp, maxWidth: '100%' } as const)
      : undefined;

  const rootClassName = ['scatterPlot', 'article__chart'].join(' ');

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
      {width > 10 && data.length > 0 && (
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
              {data.map((d, i) => (
                <circle
                  key={`${d.x}-${d.y}-${i}`}
                  cx={xScale(d.x)}
                  cy={yScale(d.y)}
                  r={pointRadius}
                  fill={pointColor}
                  stroke={colors.background}
                  strokeWidth={1.5}
                  style={{ cursor: 'default' }}
                  onMouseMove={(e) => {
                    const container = e.currentTarget.closest('.scatterPlot');
                    const svg = e.currentTarget.ownerSVGElement;
                    const point = container
                      ? localPoint(container, e)
                      : svg
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
              ))}
              <AxisLeft
                scale={yScale}
                hideTicks
                hideAxisLine
                tickFormat={(v) => formatTickValue(Number(v))}
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
                tickFormat={(v) => formatTickValue(Number(v))}
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
              {tooltipData.label ? (
                <p className="scatterPlot__tooltipLabel">{tooltipData.label}</p>
              ) : null}
              <p className="scatterPlot__tooltipMuted">
                x: {formatTickValue(tooltipData.x)}
              </p>
              <p className="scatterPlot__tooltipMuted">
                y: {formatTickValue(tooltipData.y)}
              </p>
            </TooltipWithBounds>
          )}
        </>
      )}
    </div>
  );
}

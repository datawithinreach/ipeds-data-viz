'use client';

import { useMemo } from 'react';
import { scaleLinear } from '@visx/scale';
import { Group } from '@visx/group';
import { useParentSize } from '@visx/responsive';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { chartPalette } from '@/styles/palette';
import './SlopeChart.scss';

export type SlopeSeries = {
  label: string;
  color?: string;
  start: { x: string; y: number };
  end: { x: string; y: number };
};

type Props = {
  series: SlopeSeries[];
  title?: string;
  subtitle?: string;
  height?: number;
  contained?: boolean;
};

const PRIMARY = '#501315';

function fmt(v: number): string {
  return Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function SlopeChart({ series, title, subtitle, height: heightProp, contained = false }: Props) {
  const { parentRef, width } = useParentSize();
  const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop, tooltipOpen } = useTooltip<SlopeSeries>();

  const height = heightProp ?? Math.max(360, series.length * 22 + 100);
  const margin = { top: 40, right: 200, bottom: 40, left: 200 };
  const innerW = Math.max(0, width - margin.left - margin.right);
  const innerH = Math.max(0, height - margin.top - margin.bottom);

  const allYs = useMemo(() => series.flatMap((s) => [s.start.y, s.end.y]), [series]);
  const yMin = Math.min(...allYs);
  const yMax = Math.max(...allYs);

  const yScale = useMemo(
    () => scaleLinear({ domain: [yMin * 0.98, yMax * 1.02], range: [innerH, 0], nice: true }),
    [yMin, yMax, innerH],
  );

  const startX = 0;
  const endX = innerW;
  const startLabel = series[0]?.start.x ?? '';
  const endLabel = series[0]?.end.x ?? '';

  const rootClassName = ['slopeChart', contained ? 'article__chart article__chart--contained' : 'article__chart'].join(' ');

  return (
    <div ref={parentRef} className={rootClassName}>
      {title && <h3 className="article__chartTitle">{title}</h3>}
      {subtitle && <p className="article__chartSubtitle">{subtitle}</p>}
      {width > 10 && (
        <>
          <svg width={width} height={height}>
            <Group top={margin.top} left={margin.left}>
              {/* Year labels at top */}
              <text x={startX} y={-16} textAnchor="middle" fontSize={12} fontWeight={600} fill={PRIMARY}>
                {startLabel}
              </text>
              <text x={endX} y={-16} textAnchor="middle" fontSize={12} fontWeight={600} fill={PRIMARY}>
                {endLabel}
              </text>
              {/* Vertical guide rails */}
              <line x1={startX} y1={0} x2={startX} y2={innerH} stroke="#dddddd" strokeDasharray="3 3" />
              <line x1={endX} y1={0} x2={endX} y2={innerH} stroke="#dddddd" strokeDasharray="3 3" />
              {series.map((s, i) => {
                const y0 = yScale(s.start.y);
                const y1 = yScale(s.end.y);
                const color = s.color ?? chartPalette[i % chartPalette.length];
                const delta = s.end.y - s.start.y;
                const trend = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
                return (
                  <g
                    key={s.label}
                    onMouseMove={(e) => {
                      const svg = e.currentTarget.ownerSVGElement;
                      const point = svg ? localPoint(svg, e) : localPoint(e);
                      showTooltip({
                        tooltipData: s,
                        tooltipLeft: point?.x ?? 0,
                        tooltipTop: point?.y ?? 0,
                      });
                    }}
                    onMouseLeave={hideTooltip}
                  >
                    <line x1={startX} y1={y0} x2={endX} y2={y1} stroke={color} strokeWidth={2} opacity={0.8} />
                    <circle cx={startX} cy={y0} r={5} fill={color} />
                    <circle cx={endX} cy={y1} r={5} fill={color} />
                    {/* Left labels */}
                    <text x={startX - 12} y={y0} textAnchor="end" dominantBaseline="middle" fontSize={11} fill={color} fontWeight={500}>
                      {s.label} ({fmt(s.start.y)})
                    </text>
                    {/* Right labels */}
                    <text x={endX + 12} y={y1} textAnchor="start" dominantBaseline="middle" fontSize={11} fill={color} fontWeight={500}>
                      {fmt(s.end.y)} {trend}
                    </text>
                  </g>
                );
              })}
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
              <p style={{ fontWeight: 600 }}>{tooltipData.label}</p>
              <p>
                {tooltipData.start.x}: {fmt(tooltipData.start.y)} → {tooltipData.end.x}: {fmt(tooltipData.end.y)}
              </p>
              <p style={{ color: '#666' }}>
                Δ {fmt(tooltipData.end.y - tooltipData.start.y)}
              </p>
            </TooltipWithBounds>
          )}
        </>
      )}
    </div>
  );
}

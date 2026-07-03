'use client';

import { useMemo } from 'react';
import { Group } from '@visx/group';
import { Pie } from '@visx/shape';
import { useParentSize } from '@visx/responsive';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { Legend } from '@/components/article';
import { chartPalette } from '@/styles/palette';
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
  /** Render as donut with hole. Default false (full pie). */
  donut?: boolean;
  contained?: boolean;
};

const PRIMARY = '#501315';

function fmt(v: number): string {
  return Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function PieChart({ data, title, subtitle, height = 360, donut = false, contained = false }: Props) {
  const { parentRef, width } = useParentSize();
  const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop, tooltipOpen } = useTooltip<PieDatum & { pct: number }>();

  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);

  const slices = useMemo(
    () =>
      data.map((d, i) => ({
        ...d,
        color: d.color ?? chartPalette[i % chartPalette.length],
        pct: total > 0 ? (d.value / total) * 100 : 0,
      })),
    [data, total],
  );

  const legendItems = slices.map((s) => ({ label: `${s.label} (${s.pct.toFixed(1)}%)`, color: s.color }));

  const radius = Math.min(width, height) / 2 - 8;
  const innerRadius = donut ? radius * 0.55 : 0;
  const cx = width / 2;
  const cy = height / 2;

  const rootClassName = ['pieChart', contained ? 'article__chart article__chart--contained' : 'article__chart'].join(' ');

  return (
    <div ref={parentRef} className={rootClassName}>
      {title && <h3 className="article__chartTitle">{title}</h3>}
      {subtitle && <p className="article__chartSubtitle">{subtitle}</p>}
      <Legend items={legendItems} />
      {width > 10 && (
        <>
          <svg width={width} height={height}>
            <Group top={cy} left={cx}>
              <Pie
                data={slices}
                pieValue={(d) => d.value}
                outerRadius={radius}
                innerRadius={innerRadius}
                padAngle={0.005}
              >
                {(pie) =>
                  pie.arcs.map((arc, i) => {
                    const path = pie.path(arc) ?? '';
                    return (
                      <path
                        key={i}
                        d={path}
                        fill={arc.data.color}
                        stroke="#fff"
                        strokeWidth={1.5}
                        onMouseMove={(e) => {
                          const svg = e.currentTarget.ownerSVGElement;
                          const point = svg ? localPoint(svg, e) : localPoint(e);
                          showTooltip({
                            tooltipData: arc.data,
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
              {donut && total > 0 && (
                <text textAnchor="middle" dy=".35em" className="pieChart__centerLabel">
                  {fmt(total)}
                </text>
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
              <p className="pieChart__tooltipLabel">{tooltipData.label}</p>
              <p>
                {fmt(tooltipData.value)} · {tooltipData.pct.toFixed(1)}%
              </p>
            </TooltipWithBounds>
          )}
        </>
      )}
    </div>
  );
}

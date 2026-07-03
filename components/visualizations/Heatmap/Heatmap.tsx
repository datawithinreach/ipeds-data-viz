'use client';

import { useMemo } from 'react';
import { useParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import './Heatmap.scss';

export type HeatmapCell = {
  row: string;
  col: string;
  value: number;
  /** Optional human-readable label for the value (e.g. "Required" for code 1). */
  display?: string;
};

type Props = {
  rows: string[];
  cols: string[];
  cells: HeatmapCell[];
  title?: string;
  subtitle?: string;
  height?: number;
  /** When true, treat values as discrete categorical codes (1=red, 2=orange, 3=gray, 5=blue). */
  categorical?: boolean;
  contained?: boolean;
};

const PRIMARY = '#501315';

const ADMCON_COLORS: Record<number, { color: string; label: string }> = {
  1: { color: '#2faa55', label: 'Required' },
  2: { color: '#1e6cff', label: 'Recommended' },
  3: { color: '#bbbbbb', label: 'Neither required nor recommended' },
  4: { color: '#888888', label: 'Not used' },
  5: { color: '#d4a017', label: 'Considered if submitted' },
};

function continuousColor(v: number, min: number, max: number): string {
  if (max <= min) return '#cccccc';
  const t = (v - min) / (max - min);
  // Light tan → maroon gradient
  const r = Math.round(239 + (80 - 239) * t);
  const g = Math.round(231 + (19 - 231) * t);
  const b = Math.round(210 + (21 - 210) * t);
  return `rgb(${r},${g},${b})`;
}

function fmt(v: number): string {
  return Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function Heatmap({ rows, cols, cells, title, subtitle, height: heightProp, categorical = false, contained = false }: Props) {
  const { parentRef, width } = useParentSize();
  const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop, tooltipOpen } = useTooltip<HeatmapCell>();

  const cellMap = useMemo(() => {
    const m = new Map<string, HeatmapCell>();
    for (const c of cells) m.set(`${c.row}__${c.col}`, c);
    return m;
  }, [cells]);

  const { min, max } = useMemo(() => {
    const vs = cells.map((c) => c.value).filter((v) => Number.isFinite(v));
    return { min: Math.min(...vs), max: Math.max(...vs) };
  }, [cells]);

  // Auto-size height: ~32px per row + axis space
  const height = heightProp ?? Math.max(180, rows.length * 32 + 80);

  const margin = { top: 10, right: 16, bottom: 70, left: 200 };
  const innerW = Math.max(0, width - margin.left - margin.right);
  const innerH = Math.max(0, height - margin.top - margin.bottom);
  const cellW = cols.length > 0 ? innerW / cols.length : 0;
  const cellH = rows.length > 0 ? innerH / rows.length : 0;

  const rootClassName = ['heatmap', contained ? 'article__chart article__chart--contained' : 'article__chart'].join(' ');

  return (
    <div ref={parentRef} className={rootClassName}>
      {title && <h3 className="article__chartTitle">{title}</h3>}
      {subtitle && <p className="article__chartSubtitle">{subtitle}</p>}
      {width > 10 && (
        <>
          <svg width={width} height={height}>
            <Group top={margin.top} left={margin.left}>
              {rows.map((row, ri) => (
                <text
                  key={`r-${row}`}
                  x={-8}
                  y={ri * cellH + cellH / 2}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={11}
                  fill={PRIMARY}
                >
                  {row.length > 28 ? row.slice(0, 27) + '…' : row}
                </text>
              ))}
              {cols.map((col, ci) => (
                <text
                  key={`c-${col}`}
                  x={ci * cellW + cellW / 2}
                  y={innerH + 14}
                  textAnchor="end"
                  fontSize={11}
                  fill={PRIMARY}
                  transform={`rotate(-40, ${ci * cellW + cellW / 2}, ${innerH + 14})`}
                >
                  {col.length > 22 ? col.slice(0, 21) + '…' : col}
                </text>
              ))}
              {rows.map((row, ri) =>
                cols.map((col, ci) => {
                  const cell = cellMap.get(`${row}__${col}`);
                  let fill = '#eeeeee';
                  let label = '—';
                  if (cell) {
                    if (categorical) {
                      fill = ADMCON_COLORS[cell.value]?.color ?? '#cccccc';
                      label = cell.display ?? ADMCON_COLORS[cell.value]?.label ?? String(cell.value);
                    } else {
                      fill = continuousColor(cell.value, min, max);
                      label = cell.display ?? fmt(cell.value);
                    }
                  }
                  return (
                    <g key={`cell-${ri}-${ci}`}>
                      <rect
                        x={ci * cellW + 1}
                        y={ri * cellH + 1}
                        width={Math.max(0, cellW - 2)}
                        height={Math.max(0, cellH - 2)}
                        fill={fill}
                        rx={3}
                        onMouseMove={(e) => {
                          if (!cell) return;
                          const svg = e.currentTarget.ownerSVGElement;
                          const point = svg ? localPoint(svg, e) : localPoint(e);
                          showTooltip({
                            tooltipData: { ...cell, display: label },
                            tooltipLeft: point?.x ?? 0,
                            tooltipTop: point?.y ?? 0,
                          });
                        }}
                        onMouseLeave={hideTooltip}
                      />
                      {cellW > 50 && cellH > 18 && cell && (
                        <text
                          x={ci * cellW + cellW / 2}
                          y={ri * cellH + cellH / 2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize={11}
                          fontWeight={600}
                          fill={categorical && cell.value === 3 ? '#444' : '#fff'}
                          style={{ pointerEvents: 'none' }}
                        >
                          {label.length > 14 ? label.slice(0, 13) + '…' : label}
                        </text>
                      )}
                    </g>
                  );
                }),
              )}
            </Group>
          </svg>
          {categorical && (
            <div className="heatmap__legend">
              {Object.entries(ADMCON_COLORS)
                .filter(([code]) => cells.some((c) => c.value === Number(code)))
                .map(([code, { color, label }]) => (
                  <span key={code} className="heatmap__legendItem">
                    <span className="heatmap__legendSwatch" style={{ background: color }} />
                    {label}
                  </span>
                ))}
            </div>
          )}
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
              <p style={{ fontWeight: 600 }}>
                {tooltipData.row} · {tooltipData.col}
              </p>
              <p>{tooltipData.display}</p>
            </TooltipWithBounds>
          )}
        </>
      )}
    </div>
  );
}

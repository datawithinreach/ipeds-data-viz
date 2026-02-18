'use client';

import { Group } from '@visx/group';
import { LinePath } from '@visx/shape';
import { scalePoint, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { curveMonotoneX } from '@visx/curve';
import { ParentSize } from '@visx/responsive';
import type { TuitionDatum } from '@/lib/mockData';

const margin = { top: 20, right: 20, bottom: 40, left: 60 };

function Chart({
  data,
  width,
  height,
}: {
  data: TuitionDatum[];
  width: number;
  height: number;
}) {
  if (width < 10) return null;

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const xScale = scalePoint<string>({
    range: [0, xMax],
    domain: data.map((d) => d.year),
    padding: 0.5,
  });

  const allValues = data.flatMap((d) => [d.inState, d.outOfState]);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);

  const yScale = scaleLinear<number>({
    range: [yMax, 0],
    domain: [minVal * 0.9, maxVal * 1.05],
  });

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        <GridRows
          scale={yScale}
          width={xMax}
          strokeDasharray="3,3"
          stroke="#e5e7eb"
          strokeOpacity={0.8}
        />
        <LinePath<TuitionDatum>
          data={data}
          x={(d) => xScale(d.year) ?? 0}
          y={(d) => yScale(d.inState) ?? 0}
          curve={curveMonotoneX}
          stroke="#334155"
          strokeWidth={2.5}
        />
        {data.map((d) => (
          <circle
            key={`in-${d.year}`}
            cx={xScale(d.year)}
            cy={yScale(d.inState)}
            r={4}
            fill="#334155"
            stroke="#fff"
            strokeWidth={2}
          />
        ))}
        <AxisBottom
          top={yMax}
          scale={xScale}
          tickLabelProps={{
            fill: '#6b7280',
            fontSize: 12,
            textAnchor: 'middle',
            fontFamily: 'inherit',
          }}
          stroke="#d1d5db"
          tickStroke="#d1d5db"
        />
        <AxisLeft
          scale={yScale}
          numTicks={5}
          tickFormat={(v) => `$${(Number(v) / 1000).toFixed(0)}k`}
          tickLabelProps={{
            fill: '#6b7280',
            fontSize: 12,
            textAnchor: 'end',
            dx: '-0.25em',
            dy: '0.25em',
            fontFamily: 'inherit',
          }}
          stroke="#d1d5db"
          tickStroke="#d1d5db"
        />
      </Group>
    </svg>
  );
}

export default function TuitionLineChart({ data }: { data: TuitionDatum[] }) {
  return (
    <div className="h-[350px] w-full">
      <ParentSize>
        {({ width, height }) => (
          <Chart data={data} width={width} height={height} />
        )}
      </ParentSize>
    </div>
  );
}

'use client';

import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { ParentSize } from '@visx/responsive';
import type { DegreeFieldDatum } from '@/lib/mockData';

const margin = { top: 20, right: 20, bottom: 60, left: 110 };

function Chart({
  data,
  width,
  height,
}: {
  data: DegreeFieldDatum[];
  width: number;
  height: number;
}) {
  if (width < 10) return null;

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const yScale = scaleBand<string>({
    range: [0, yMax],
    round: true,
    domain: data.map((d) => d.field),
    padding: 0.3,
  });

  const xScale = scaleLinear<number>({
    range: [0, xMax],
    round: true,
    domain: [0, Math.max(...data.map((d) => d.count)) * 1.1],
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
        {data.map((d) => {
          const barHeight = yScale.bandwidth();
          const barWidth = xScale(d.count) ?? 0;
          const barY = yScale(d.field) ?? 0;

          return (
            <Bar
              key={d.field}
              x={0}
              y={barY}
              width={barWidth}
              height={barHeight}
              fill="#334155"
              rx={4}
              opacity={0.9}
            />
          );
        })}
        <AxisBottom
          top={yMax}
          scale={xScale}
          numTicks={5}
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
          tickLabelProps={{
            fill: '#6b7280',
            fontSize: 12,
            textAnchor: 'end',
            dx: '-0.25em',
            dy: '0.33em',
            fontFamily: 'inherit',
          }}
          stroke="#d1d5db"
          tickStroke="#d1d5db"
        />
      </Group>
    </svg>
  );
}

export default function DegreeBarChart({ data }: { data: DegreeFieldDatum[] }) {
  return (
    <div className="h-[380px] w-full">
      <ParentSize>
        {({ width, height }) => (
          <Chart data={data} width={width} height={height} />
        )}
      </ParentSize>
    </div>
  );
}

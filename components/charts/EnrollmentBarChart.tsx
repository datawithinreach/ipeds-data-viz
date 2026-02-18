'use client';

import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { ParentSize } from '@visx/responsive';
import type { EnrollmentDatum } from '@/lib/mockData';

const margin = { top: 20, right: 20, bottom: 40, left: 60 };

function Chart({
  data,
  width,
  height,
}: {
  data: EnrollmentDatum[];
  width: number;
  height: number;
}) {
  if (width < 10) return null;

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const xScale = scaleBand<string>({
    range: [0, xMax],
    round: true,
    domain: data.map((d) => d.year),
    padding: 0.3,
  });

  const yScale = scaleLinear<number>({
    range: [yMax, 0],
    round: true,
    domain: [0, Math.max(...data.map((d) => d.total)) * 1.1],
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
          const barWidth = xScale.bandwidth();
          const barHeight = yMax - (yScale(d.total) ?? 0);
          const barX = xScale(d.year) ?? 0;
          const barY = yMax - barHeight;

          return (
            <Bar
              key={d.year}
              x={barX}
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
          tickFormat={(v) => `${(Number(v) / 1000).toFixed(1)}k`}
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

export default function EnrollmentBarChart({
  data,
}: {
  data: EnrollmentDatum[];
}) {
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

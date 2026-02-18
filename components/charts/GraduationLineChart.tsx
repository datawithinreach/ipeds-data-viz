'use client';

import { Group } from '@visx/group';
import { LinePath, AreaClosed } from '@visx/shape';
import { scalePoint, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { LinearGradient } from '@visx/gradient';
import { curveMonotoneX } from '@visx/curve';
import { ParentSize } from '@visx/responsive';
import type { GraduationDatum } from '@/lib/mockData';

const margin = { top: 20, right: 20, bottom: 40, left: 50 };

function Chart({
  data,
  width,
  height,
}: {
  data: GraduationDatum[];
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

  const minRate = Math.min(...data.map((d) => d.rate));
  const maxRate = Math.max(...data.map((d) => d.rate));

  const yScale = scaleLinear<number>({
    range: [yMax, 0],
    domain: [minRate - 3, maxRate + 2],
  });

  return (
    <svg width={width} height={height}>
      <LinearGradient
        id="area-gradient"
        from="#0d9488"
        to="#0d9488"
        fromOpacity={0.3}
        toOpacity={0.02}
      />
      <Group left={margin.left} top={margin.top}>
        <GridRows
          scale={yScale}
          width={xMax}
          strokeDasharray="3,3"
          stroke="#e5e7eb"
          strokeOpacity={0.8}
        />
        <AreaClosed<GraduationDatum>
          data={data}
          x={(d) => xScale(d.year) ?? 0}
          y={(d) => yScale(d.rate) ?? 0}
          yScale={yScale}
          curve={curveMonotoneX}
          fill="url(#area-gradient)"
        />
        <LinePath<GraduationDatum>
          data={data}
          x={(d) => xScale(d.year) ?? 0}
          y={(d) => yScale(d.rate) ?? 0}
          curve={curveMonotoneX}
          stroke="#0d9488"
          strokeWidth={2.5}
        />
        {data.map((d) => (
          <circle
            key={d.year}
            cx={xScale(d.year)}
            cy={yScale(d.rate)}
            r={4}
            fill="#0d9488"
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
          tickFormat={(v) => `${v}%`}
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

export default function GraduationLineChart({
  data,
}: {
  data: GraduationDatum[];
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

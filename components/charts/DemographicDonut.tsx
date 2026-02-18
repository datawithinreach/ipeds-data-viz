'use client';

import { Group } from '@visx/group';
import { Pie } from '@visx/shape';
import { Text } from '@visx/text';
import { ParentSize } from '@visx/responsive';
import type { DemographicDatum } from '@/lib/mockData';

function Chart({
  data,
  width,
  height,
}: {
  data: DemographicDatum[];
  width: number;
  height: number;
}) {
  if (width < 10) return null;

  const radius = Math.min(width, height) / 2;
  const innerRadius = radius * 0.6;
  const centerY = height / 2;
  const centerX = width / 2;

  return (
    <svg width={width} height={height}>
      <Group top={centerY} left={centerX}>
        <Pie
          data={data}
          pieValue={(d) => d.value}
          outerRadius={radius - 10}
          innerRadius={innerRadius}
          cornerRadius={3}
          padAngle={0.02}
        >
          {(pie) =>
            pie.arcs.map((arc) => {
              const [centroidX, centroidY] = pie.path.centroid(arc);
              const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.4;

              return (
                <g key={arc.data.label}>
                  <path d={pie.path(arc) ?? ''} fill={arc.data.color} />
                  {hasSpaceForLabel && (
                    <Text
                      x={centroidX}
                      y={centroidY}
                      dy=".33em"
                      fill="#fff"
                      fontSize={12}
                      textAnchor="middle"
                      fontWeight={600}
                      fontFamily="inherit"
                    >
                      {arc.data.label}
                    </Text>
                  )}
                </g>
              );
            })
          }
        </Pie>
        <Text
          textAnchor="middle"
          fill="#8B2332"
          fontSize={14}
          dy={-8}
          fontWeight={600}
          fontFamily="inherit"
        >
          Student
        </Text>
        <Text
          textAnchor="middle"
          fill="#8C7A4E"
          fontSize={13}
          dy={10}
          fontFamily="inherit"
        >
          Demographics
        </Text>
      </Group>
    </svg>
  );
}

export default function DemographicDonut({
  data,
}: {
  data: DemographicDatum[];
}) {
  return (
    <div className="h-[300px] w-full">
      <ParentSize>
        {({ width, height }) => (
          <Chart data={data} width={width} height={height} />
        )}
      </ParentSize>
    </div>
  );
}

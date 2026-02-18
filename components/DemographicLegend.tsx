import type { DemographicDatum } from '@/lib/mockData';

export default function DemographicLegend({
  data,
}: {
  data: DemographicDatum[];
}) {
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-4">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: d.color }}
          />
          <span className="text-sm text-gray-600">
            {d.label} ({d.value}%)
          </span>
        </div>
      ))}
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  description: string;
};

export default function StatCard({ label, value, description }: StatCardProps) {
  return (
    <div className="border-accent/15 flex flex-col rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <span className="text-accent-dark text-sm font-medium tracking-wide uppercase">
        {label}
      </span>
      <span className="text-primary mt-2 text-3xl font-bold">{value}</span>
      <span className="mt-1 text-sm text-gray-500">{description}</span>
    </div>
  );
}

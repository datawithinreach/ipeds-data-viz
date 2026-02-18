type ChartSectionProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  reversed?: boolean;
};

export default function ChartSection({
  title,
  description,
  children,
  reversed = false,
}: ChartSectionProps) {
  return (
    <section className="w-full py-12">
      <div
        className={`flex flex-col items-center gap-8 lg:flex-row ${
          reversed ? 'lg:flex-row-reverse' : ''
        }`}
      >
        <div className="flex flex-1 flex-col gap-4">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <div className="bg-accent h-1 w-12 rounded" />
          <p className="leading-relaxed text-gray-600">{description}</p>
        </div>
        <div className="w-full flex-1">{children}</div>
      </div>
    </section>
  );
}

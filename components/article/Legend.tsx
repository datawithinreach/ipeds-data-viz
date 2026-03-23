type LegendItem = {
  label: string;
  color: string;
};

type Props = {
  items: LegendItem[];
};

export function Legend({ items }: Props) {
  return (
    <div className="article__legend">
      {items.map((item) => (
        <span key={item.label} className="article__legendItem">
          <span
            className="article__legendSwatch"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

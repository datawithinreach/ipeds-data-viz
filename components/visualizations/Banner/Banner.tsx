type Props = {
  value: string;
  label: string;
  accent?: 'primary' | 'navbar' | 'button';
};

const ACCENT_CLASSES: Record<NonNullable<Props['accent']>, string> = {
  primary: 'border-primary',
  navbar: 'border-navbar',
  button: 'border-[#FAE3B1]',
};

export function Banner({ value, label, accent = 'primary' }: Props) {
  return (
    <div className={`my-8 border-l-4 py-1 pl-6 ${ACCENT_CLASSES[accent]}`}>
      <div className="font-(family-name:--font-red-hat-mono) text-3xl font-bold text-primary">
        {value}
      </div>
      <div className="mt-1 max-w-xl text-sm text-primary/70">{label}</div>
    </div>
  );
}

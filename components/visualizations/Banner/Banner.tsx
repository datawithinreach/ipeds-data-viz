import './Banner.scss';

type Props = {
  value: string;
  label: string;
  accent?: 'primary' | 'navbar' | 'button';
};

const ACCENT_CLASSES: Record<NonNullable<Props['accent']>, string> = {
  primary: 'banner--primary',
  navbar: 'banner--navbar',
  button: 'banner--button',
};

export function Banner({ value, label, accent = 'primary' }: Props) {
  return (
    <div className={`banner ${ACCENT_CLASSES[accent]}`}>
      <div className="banner__value">{value}</div>
      <div className="banner__label">{label}</div>
    </div>
  );
}

import { T } from '@/lib/constants';

interface Props { value: number; max: number; color?: string; }

export function ProgressBar({ value, max, color = T.accent }: Props) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ background: T.tanLight, borderRadius: 2, height: 3, overflow: 'hidden' }}>
      <div style={{ width: pct + '%', height: '100%', background: color, borderRadius: 2, transition: 'width 0.6s ease' }} />
    </div>
  );
}

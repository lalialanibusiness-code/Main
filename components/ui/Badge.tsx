import { T } from '@/lib/constants';

interface Props {
  children: React.ReactNode;
  color?: string;
  size?: 'sm' | 'lg';
}

export function Badge({ children, color = T.accent, size = 'sm' }: Props) {
  const pad = size === 'lg' ? '5px 14px' : '3px 10px';
  const fs = size === 'lg' ? 11 : 9;
  return (
    <span style={{ background: color + '18', color, border: `1px solid ${color}55`, borderRadius: 3, padding: pad, fontSize: fs, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
}

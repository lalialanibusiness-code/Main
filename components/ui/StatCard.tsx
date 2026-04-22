import { T } from '@/lib/constants';

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: string;
}

export function StatCard({ label, value, sub, color = T.accent, icon }: Props) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 4, padding: '22px 24px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 16, right: 18, fontSize: 20, opacity: 0.15 }}>{icon}</div>
      <div style={{ color: T.dim, fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>{label}</div>
      <div style={{ color, fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 30, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ color: T.dim, fontSize: 11, marginTop: 8, letterSpacing: 0.3 }}>{sub}</div>}
    </div>
  );
}

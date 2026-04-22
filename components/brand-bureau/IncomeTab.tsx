import { T, PLATFORM_META, fmtMoney, fmtDate, daysUntil } from '@/lib/constants';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import type { Deal } from '@/lib/supabase/types';

interface Props { deals: Deal[]; }

export function IncomeTab({ deals }: Props) {
  const allDeals = deals.filter(d => d.status !== 'Negotiating');
  const totalValue = allDeals.reduce((s, d) => s + d.total_value, 0);
  const totalPaid = allDeals.reduce((s, d) => s + d.paid, 0);
  const totalOwed = totalValue - totalPaid;

  const byPlatform: Record<string, { total: number; count: number }> = {};
  allDeals.forEach(d => (d.platform_deliverables ?? []).forEach(p => {
    if (!byPlatform[p.platform]) byPlatform[p.platform] = { total: 0, count: 0 };
    byPlatform[p.platform].total += p.rate * p.qty;
    byPlatform[p.platform].count += p.qty;
  }));

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
        <StatCard label="Total Contracted" value={fmtMoney(totalValue)} color={T.accentMid} icon="◎" />
        <StatCard label="Received"         value={fmtMoney(totalPaid)}  color={T.green}     icon="✓" />
        <StatCard label="Outstanding"      value={fmtMoney(totalOwed)}  color={T.yellow}    icon="⧖" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 4, padding: 24 }}>
          <div style={{ color: T.dim, fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: 600, marginBottom: 18 }}>Revenue by Platform</div>
          {Object.keys(byPlatform).length === 0 && <div style={{ color: T.dim, fontSize: 13, fontStyle: 'italic' }}>No data yet.</div>}
          {Object.entries(byPlatform).sort((a, b) => b[1].total - a[1].total).map(([plat, data]) => {
            const meta = PLATFORM_META[plat] ?? { icon: '📱', color: T.accent };
            return (
              <div key={plat} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: T.accentMid, fontWeight: 600, fontSize: 13 }}>{meta.icon} {plat}</span>
                  <div>
                    <span style={{ color: T.text, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{fmtMoney(data.total)}</span>
                    <span style={{ color: T.dim, fontSize: 11 }}> · {data.count}</span>
                  </div>
                </div>
                <ProgressBar value={data.total} max={totalValue || 1} color={T.accentMid} />
              </div>
            );
          })}
        </div>

        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 4, padding: 24 }}>
          <div style={{ color: T.dim, fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: 600, marginBottom: 18 }}>Deal Breakdown</div>
          {allDeals.length === 0 && <div style={{ color: T.dim, fontSize: 13, fontStyle: 'italic' }}>No deals yet.</div>}
          {allDeals.map(d => (
            <div key={d.id} style={{ padding: '13px 0', borderBottom: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: T.text, fontWeight: 600, fontFamily: "'Playfair Display', serif", fontSize: 14 }}>{d.brand}</span>
                <span style={{ color: T.text, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{fmtMoney(d.total_value)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                <span style={{ color: T.green }}>Paid: {fmtMoney(d.paid)}</span>
                <span style={{ color: T.yellow }}>Owed: {fmtMoney(d.total_value - d.paid)}</span>
              </div>
              <ProgressBar value={d.paid} max={d.total_value || 1} color={T.green} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 4, padding: 24 }}>
        <div style={{ color: T.dim, fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: 600, marginBottom: 18 }}>Payment Schedule</div>
        {allDeals.filter(d => d.paid < d.total_value).length === 0 && <div style={{ color: T.dim, fontSize: 13, fontStyle: 'italic' }}>No outstanding payments.</div>}
        {allDeals.filter(d => d.paid < d.total_value).map(d => {
          const days = d.due_date ? daysUntil(d.due_date) : null;
          return (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 18, background: T.surface, borderRadius: 3, padding: '13px 18px', marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: T.text, fontWeight: 600, fontFamily: "'Playfair Display', serif", fontSize: 14 }}>{d.brand}</div>
                <div style={{ color: T.dim, fontSize: 11, marginTop: 3 }}>{(d.platform_deliverables ?? []).map(p => `${p.qty}× ${p.type}`).join(' · ')}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: T.yellow, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{fmtMoney(d.total_value - d.paid)}</div>
                {d.due_date && <div style={{ color: T.dim, fontSize: 11, marginTop: 3 }}>{fmtDate(d.due_date)}</div>}
              </div>
              {days !== null && <Badge color={days < 14 ? T.red : T.yellow}>{days}d</Badge>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

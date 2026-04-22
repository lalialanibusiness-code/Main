import { T, PLATFORM_META, fmtMoney, fmtDate, daysUntil } from '@/lib/constants';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatCard } from '@/components/ui/StatCard';
import type { Deal, Inquiry } from '@/lib/supabase/types';

interface Props { deals: Deal[]; emails: Inquiry[]; }

export function DashboardTab({ deals, emails }: Props) {
  const activeDeals = deals.filter(d => d.status === 'Active');
  const totalEarned = deals.reduce((s, d) => s + d.paid, 0);
  const totalPipeline = deals.filter(d => d.status !== 'Completed').reduce((s, d) => s + (d.total_value - d.paid), 0);
  const unreadEmails = emails.filter(e => e.status === 'Unread').length;

  const upcoming = activeDeals
    .map(d => ({ ...d, days: d.due_date ? daysUntil(d.due_date) : 999 }))
    .sort((a, b) => a.days - b.days)
    .slice(0, 3);

  const pendingTasks = deals
    .filter(d => d.status !== 'Negotiating')
    .flatMap(d => (d.platform_deliverables ?? []).flatMap((p, pi) =>
      p.done.map((done, ci) => ({ done, deal: d.brand, platform: p.platform, type: p.type, pi, ci }))
    ))
    .filter(t => !t.done)
    .slice(0, 5);

  const platformBreakdown: Record<string, number> = {};
  deals.filter(d => d.status !== 'Negotiating').forEach(d =>
    (d.platform_deliverables ?? []).forEach(p => {
      platformBreakdown[p.platform] = (platformBreakdown[p.platform] || 0) + p.rate * p.qty;
    })
  );

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 30 }}>
        <StatCard label="Total Earned"  value={fmtMoney(totalEarned)}   sub="Payments received"       color={T.green}     icon="$" />
        <StatCard label="Pipeline"      value={fmtMoney(totalPipeline)} sub="Remaining to collect"    color={T.accentMid} icon="↑" />
        <StatCard label="Active Deals"  value={activeDeals.length}      sub={`${deals.length} total`} color={T.blue}      icon="●" />
        <StatCard label="New Inquiries" value={unreadEmails}            sub="Awaiting review"          color={T.yellow}    icon="✉" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 4, padding: 24 }}>
          <div style={{ color: T.dim, fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: 600, marginBottom: 18 }}>Upcoming Deadlines</div>
          {upcoming.length === 0 && <div style={{ color: T.dim, fontSize: 13, fontStyle: 'italic' }}>No upcoming deadlines.</div>}
          {upcoming.map(d => (
            <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: `1px solid ${T.border}` }}>
              <div>
                <div style={{ color: T.text, fontWeight: 600, fontSize: 14, fontFamily: "'Playfair Display', serif" }}>{d.brand}</div>
                <div style={{ color: T.dim, fontSize: 11, marginTop: 3, letterSpacing: 0.3 }}>{d.due_date ? fmtDate(d.due_date) : '—'}</div>
              </div>
              <Badge color={d.days < 7 ? T.red : d.days < 21 ? T.yellow : T.green}>{d.days}d left</Badge>
            </div>
          ))}
        </div>

        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 4, padding: 24 }}>
          <div style={{ color: T.dim, fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: 600, marginBottom: 18 }}>Revenue by Platform</div>
          {Object.entries(platformBreakdown).length === 0 && <div style={{ color: T.dim, fontSize: 13, fontStyle: 'italic' }}>No data yet.</div>}
          {Object.entries(platformBreakdown).map(([plat, val]) => {
            const meta = PLATFORM_META[plat] ?? { icon: '📱', color: T.accent };
            const total = Object.values(platformBreakdown).reduce((a, b) => a + b, 0);
            return (
              <div key={plat} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                  <span style={{ color: T.accentMid, fontSize: 12, fontWeight: 600 }}>{meta.icon} {plat}</span>
                  <span style={{ color: T.text, fontSize: 13, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{fmtMoney(val)}</span>
                </div>
                <ProgressBar value={val} max={total} color={T.accentMid} />
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 4, padding: 24 }}>
        <div style={{ color: T.dim, fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: 600, marginBottom: 18 }}>Pending Deliverables</div>
        {pendingTasks.length === 0 && <div style={{ color: T.dim, fontSize: 13, fontStyle: 'italic' }}>All caught up.</div>}
        <div style={{ display: 'grid', gap: 8 }}>
          {pendingTasks.map((t, i) => {
            const meta = PLATFORM_META[t.platform] ?? { icon: '📱', color: T.accent };
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, background: T.surface, borderRadius: 3, padding: '12px 18px' }}>
                <span style={{ fontSize: 16 }}>{meta.icon}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ color: T.text, fontWeight: 600, fontSize: 13 }}>{t.type}</span>
                  <span style={{ color: T.dim, fontSize: 12 }}> — {t.deal}</span>
                </div>
                <Badge color={meta.color}>{t.platform}</Badge>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

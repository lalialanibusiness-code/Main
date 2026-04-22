'use client';

import { useState } from 'react';
import { T, PLATFORM_META, fmtMoney, daysUntil } from '@/lib/constants';
import { Badge } from '@/components/ui/Badge';
import { Divider } from '@/components/ui/Spinner';
import type { Deal } from '@/lib/supabase/types';
import { createClient } from '@/lib/supabase/client';

interface Props { deals: Deal[]; setDeals: (d: Deal[]) => void; }

interface Task {
  done: boolean;
  dealId: string;
  delivId: string;
  pi: number;
  ci: number;
  brand: string;
  platform: string;
  type: string;
  rate: number;
  due_date: string | null;
  label: string;
}

export function TasksTab({ deals, setDeals }: Props) {
  const supabase = createClient();
  const [filterPlat, setFilterPlat] = useState('All');
  const platforms = ['All', ...Object.keys(PLATFORM_META)];

  const allTasks: Task[] = deals
    .filter(d => d.status !== 'Negotiating')
    .flatMap(d =>
      (d.platform_deliverables ?? []).flatMap((p, pi) =>
        p.done.map((done, ci) => ({
          done, dealId: d.id, delivId: p.id, pi, ci,
          brand: d.brand, platform: p.platform, type: p.type, rate: p.rate, due_date: d.due_date,
          label: p.qty > 1 ? `${p.type} #${ci + 1}` : p.type,
        }))
      )
    )
    .filter(t => filterPlat === 'All' || t.platform === filterPlat);

  const pending = allTasks.filter(t => !t.done);
  const done = allTasks.filter(t => t.done);

  const toggle = async (t: Task) => {
    const deal = deals.find(d => d.id === t.dealId);
    if (!deal) return;
    const deliv = deal.platform_deliverables?.find(p => p.id === t.delivId);
    if (!deliv) return;
    const newDone = deliv.done.map((v, j) => j === t.ci ? !v : v);
    setDeals(deals.map(d => d.id !== t.dealId ? d : {
      ...d,
      platform_deliverables: d.platform_deliverables?.map(p =>
        p.id !== t.delivId ? p : { ...p, done: newDone }
      ),
    }));
    await supabase.from('platform_deliverables').update({ done: newDone }).eq('id', t.delivId);
  };

  const TaskRow = ({ t }: { t: Task }) => {
    const meta = PLATFORM_META[t.platform] ?? { icon: '📱', color: T.accent };
    const days = t.due_date ? daysUntil(t.due_date) : null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: T.card, border: `1px solid ${T.border}`, borderLeft: `3px solid ${t.done ? T.green : T.tan}`, borderRadius: 4, padding: '13px 18px', marginBottom: 8, opacity: t.done ? 0.55 : 1, transition: 'opacity 0.2s' }}>
        <button onClick={() => toggle(t)}
          style={{ width: 22, height: 22, borderRadius: 2, border: `1.5px solid ${t.done ? T.green : T.dimmer}`, background: t.done ? T.green : 'transparent', color: T.card, fontSize: 12, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {t.done ? '✓' : ''}
        </button>
        <span>{meta.icon}</span>
        <div style={{ flex: 1 }}>
          <span style={{ color: T.text, fontWeight: 600, fontSize: 13, textDecoration: t.done ? 'line-through' : 'none' }}>{t.label}</span>
          <span style={{ color: T.dim, fontSize: 12 }}> — <span style={{ color: T.accentLight }}>{t.brand}</span></span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Badge color={meta.color}>{t.platform}</Badge>
          {!t.done && days !== null && <Badge color={days < 7 ? T.red : days < 14 ? T.yellow : T.dim}>{days}d</Badge>}
          <span style={{ color: T.green, fontWeight: 700, fontSize: 13, fontFamily: "'Playfair Display', serif" }}>{fmtMoney(t.rate)}</span>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 22, flexWrap: 'wrap' }}>
        {platforms.map(p => (
          <button key={p} onClick={() => setFilterPlat(p)}
            style={{ background: filterPlat === p ? T.accent : 'transparent', color: filterPlat === p ? T.bg : T.dim, border: `1px solid ${filterPlat === p ? T.accent : T.border}`, borderRadius: 3, padding: '5px 14px', fontSize: 11, fontWeight: 600, cursor: 'pointer', letterSpacing: 0.8 }}>
            {PLATFORM_META[p]?.icon ?? ''} {p}
          </button>
        ))}
      </div>
      <div style={{ color: T.dim, fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>Pending — {pending.length}</div>
      {pending.length === 0 && <div style={{ color: T.dim, fontSize: 14, marginBottom: 20, fontStyle: 'italic' }}>All caught up.</div>}
      {pending.map((t, i) => <TaskRow key={i} t={t} />)}
      {done.length > 0 && (
        <>
          <Divider />
          <div style={{ color: T.dim, fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>Completed — {done.length}</div>
          {done.map((t, i) => <TaskRow key={i} t={t} />)}
        </>
      )}
    </div>
  );
}

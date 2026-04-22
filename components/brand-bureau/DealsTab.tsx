'use client';

import { useState } from 'react';
import { T, PLATFORM_META, CONTENT_TYPES, fmtMoney, fmtDate } from '@/lib/constants';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { Deal, PlatformDeliverable } from '@/lib/supabase/types';
import { createClient } from '@/lib/supabase/client';

interface Props { deals: Deal[]; setDeals: (d: Deal[]) => void; userId: string; }

const STATUS_COLOR: Record<string, string> = {
  Active: T.green, Negotiating: T.yellow, Completed: T.accentMid, Declined: T.red,
};

const newDealTemplate = () => ({
  brand: '', niche: '', status: 'Active' as const, total_value: 0, paid: 0,
  due_date: '', notes: '', contact: '', tags: [] as string[],
  platforms: [] as Array<{ platform: string; type: string; qty: number; rate: number; done: boolean[] }>,
});

export function DealsTab({ deals, setDeals, userId }: Props) {
  const supabase = createClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('All');
  const [draft, setDraft] = useState(newDealTemplate());
  const [saving, setSaving] = useState(false);

  const filtered = filter === 'All' ? deals : deals.filter(d => d.status === filter);
  const deal = selected ? deals.find(d => d.id === selected) : null;

  const toggleDeliverable = async (dealId: string, delivId: string, ci: number, currentDone: boolean[]) => {
    const newDone = currentDone.map((v, j) => j === ci ? !v : v);
    setDeals(deals.map(d => d.id !== dealId ? d : {
      ...d,
      platform_deliverables: d.platform_deliverables?.map(p =>
        p.id !== delivId ? p : { ...p, done: newDone }
      ),
    }));
    await supabase.from('platform_deliverables').update({ done: newDone }).eq('id', delivId);
  };

  const addDeal = async () => {
    if (!draft.brand) return;
    setSaving(true);
    const { data: dealRow, error } = await supabase
      .from('deals')
      .insert({
        user_id: userId, brand: draft.brand, niche: draft.niche,
        status: draft.status, total_value: draft.total_value, paid: draft.paid,
        due_date: draft.due_date || null, notes: draft.notes, contact: draft.contact,
        tags: draft.tags,
      })
      .select()
      .single();
    if (error || !dealRow) { setSaving(false); return; }

    const deliverables: PlatformDeliverable[] = [];
    for (const p of draft.platforms) {
      const { data: row } = await supabase
        .from('platform_deliverables')
        .insert({ deal_id: dealRow.id, user_id: userId, platform: p.platform, type: p.type, qty: p.qty, rate: p.rate, done: p.done })
        .select()
        .single();
      if (row) deliverables.push(row as PlatformDeliverable);
    }

    setDeals([...deals, { ...dealRow, platform_deliverables: deliverables } as Deal]);
    setSaving(false);
    setShowAdd(false);
    setDraft(newDealTemplate());
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 3,
    padding: '9px 13px', color: T.text, fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: deal ? '320px 1fr' : '1fr', gap: 22 }}>
      <div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {['All', 'Active', 'Negotiating', 'Completed'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{ background: filter === s ? T.accent : 'transparent', color: filter === s ? T.bg : T.dim, border: `1px solid ${filter === s ? T.accent : T.border}`, borderRadius: 3, padding: '5px 14px', fontSize: 11, fontWeight: 600, cursor: 'pointer', letterSpacing: 0.8 }}>
              {s}
            </button>
          ))}
          <button onClick={() => setShowAdd(true)}
            style={{ marginLeft: 'auto', background: T.accent, color: T.bg, border: 'none', borderRadius: 3, padding: '5px 16px', fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.8 }}>
            + New Deal
          </button>
        </div>

        {filtered.length === 0 && <div style={{ color: T.dim, fontSize: 13, fontStyle: 'italic', padding: '20px 0' }}>No deals yet. Add your first one above.</div>}
        {filtered.map(d => {
          const all = (d.platform_deliverables ?? []).flatMap(p => p.done);
          const done = all.filter(Boolean).length;
          const pct = all.length ? Math.round(done / all.length * 100) : 0;
          return (
            <div key={d.id} onClick={() => setSelected(selected === d.id ? null : d.id)}
              style={{ background: selected === d.id ? T.surface : T.card, border: `1px solid ${selected === d.id ? T.accentMid : T.border}`, borderLeft: selected === d.id ? `3px solid ${T.accentMid}` : '3px solid transparent', borderRadius: 4, padding: '16px 18px', marginBottom: 10, cursor: 'pointer', transition: 'all 0.15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, color: T.text, fontSize: 15, fontFamily: "'Playfair Display', serif" }}>{d.brand}</div>
                  <div style={{ color: T.dim, fontSize: 11, marginTop: 3, letterSpacing: 0.3 }}>{d.niche}</div>
                </div>
                <Badge color={STATUS_COLOR[d.status] ?? T.dim}>{d.status}</Badge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 10 }}>
                <span style={{ color: T.green, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{fmtMoney(d.total_value)}</span>
                <span style={{ color: T.dim, fontSize: 11 }}>{d.due_date ? fmtDate(d.due_date) : '—'}</span>
              </div>
              <ProgressBar value={pct} max={100} color={pct === 100 ? T.green : T.accentMid} />
              <div style={{ color: T.dim, fontSize: 10, marginTop: 6, letterSpacing: 0.5 }}>{done}/{all.length} deliverables complete</div>
            </div>
          );
        })}
      </div>

      {deal && (
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 4, padding: 30, maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 26 }}>
            <div>
              <h2 style={{ margin: 0, color: T.text, fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700 }}>{deal.brand}</h2>
              <div style={{ color: T.dim, fontSize: 12, marginTop: 5, letterSpacing: 0.3 }}>{deal.contact}</div>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: T.surface, color: T.dim, border: `1px solid ${T.border}`, borderRadius: 3, padding: '5px 14px', cursor: 'pointer', fontSize: 12 }}>Close</button>
          </div>

          <div style={{ background: T.surface, borderRadius: 4, padding: 20, marginBottom: 22 }}>
            <div style={{ color: T.dim, fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Payment Status</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              {([['Total', deal.total_value, T.text], ['Received', deal.paid, T.green], ['Outstanding', deal.total_value - deal.paid, T.yellow]] as [string, number, string][]).map(([l, v, c]) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <div style={{ color: T.dim, fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>{l}</div>
                  <div style={{ color: c, fontWeight: 700, fontSize: 20, fontFamily: "'Playfair Display', serif" }}>{fmtMoney(v)}</div>
                </div>
              ))}
            </div>
            <ProgressBar value={deal.paid} max={deal.total_value || 1} color={T.green} />
            <div style={{ color: T.dim, fontSize: 10, marginTop: 8, letterSpacing: 0.5 }}>
              {Math.round(deal.paid / (deal.total_value || 1) * 100)}% paid{deal.due_date ? ` · Due ${fmtDate(deal.due_date)}` : ''}
            </div>
          </div>

          {(deal.platform_deliverables ?? []).length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ color: T.dim, fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Deliverables</div>
              {(deal.platform_deliverables ?? []).map(p => {
                const meta = PLATFORM_META[p.platform] ?? { icon: '📱', color: T.accent };
                return (
                  <div key={p.id} style={{ background: T.surface, borderRadius: 4, padding: '14px 18px', marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span>{meta.icon}</span>
                        <span style={{ color: T.text, fontWeight: 600, fontSize: 13 }}>{p.platform} · {p.type} × {p.qty}</span>
                      </div>
                      <span style={{ color: T.green, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{fmtMoney(p.rate * p.qty)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {p.done.map((isDone, ci) => (
                        <button key={ci} onClick={() => toggleDeliverable(deal.id, p.id, ci, p.done)}
                          style={{ background: isDone ? T.green + '20' : 'transparent', color: isDone ? T.green : T.dim, border: `1px solid ${isDone ? T.green : T.border}`, borderRadius: 3, padding: '5px 14px', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                          {isDone ? '✓' : '○'} {p.type}{p.qty > 1 ? ` #${ci + 1}` : ''}
                        </button>
                      ))}
                    </div>
                    <div style={{ color: T.dim, fontSize: 10, marginTop: 8, letterSpacing: 0.5 }}>{fmtMoney(p.rate)} per unit</div>
                  </div>
                );
              })}
            </div>
          )}

          {deal.notes && (
            <div style={{ background: T.tanLight, borderRadius: 4, padding: 18, borderLeft: `3px solid ${T.tan}` }}>
              <div style={{ color: T.dim, fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>Brand Notes</div>
              <div style={{ color: T.accentMid, fontSize: 13, lineHeight: 1.7 }}>{deal.notes}</div>
            </div>
          )}
        </div>
      )}

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: '#1A100888', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 6, padding: 34, width: 560, maxHeight: '85vh', overflowY: 'auto' }}>
            <h3 style={{ color: T.text, margin: '0 0 26px', fontFamily: "'Playfair Display', serif", fontSize: 22 }}>New Brand Deal</h3>
            {(['brand', 'niche', 'contact', 'notes'] as const).map(key => (
              <div key={key} style={{ marginBottom: 14 }}>
                <div style={{ color: T.dim, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>{key === 'brand' ? 'Brand Name' : key === 'niche' ? 'Niche' : key === 'contact' ? 'Contact Email' : 'Notes / Brief'}</div>
                <input value={(draft as Record<string, string>)[key]} onChange={e => setDraft({ ...draft, [key]: e.target.value })} style={inputStyle} />
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
              {(['total_value', 'paid'] as const).map(key => (
                <div key={key}>
                  <div style={{ color: T.dim, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>{key === 'total_value' ? 'Total Value' : 'Amount Paid'}</div>
                  <input type="number" value={draft[key]} onChange={e => setDraft({ ...draft, [key]: +e.target.value })} style={inputStyle} />
                </div>
              ))}
              <div>
                <div style={{ color: T.dim, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Due Date</div>
                <input type="date" value={draft.due_date} onChange={e => setDraft({ ...draft, due_date: e.target.value })} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ color: T.dim, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Status</div>
              <select value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value as Deal['status'] })} style={inputStyle}>
                {['Active', 'Negotiating', 'Completed'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ color: T.dim, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600 }}>Deliverables</div>
                <button onClick={() => setDraft({ ...draft, platforms: [...draft.platforms, { platform: 'Instagram', type: 'Reel', qty: 1, rate: 0, done: [false] }] })}
                  style={{ background: T.tanLight, color: T.accentMid, border: `1px solid ${T.border}`, borderRadius: 3, padding: '3px 12px', fontSize: 11, cursor: 'pointer' }}>+ Add Row</button>
              </div>
              {draft.platforms.map((p, pi) => (
                <div key={pi} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 70px 80px', gap: 8, marginBottom: 8 }}>
                  <select value={p.platform} onChange={e => { const pl = [...draft.platforms]; pl[pi] = { ...pl[pi], platform: e.target.value, type: CONTENT_TYPES[e.target.value][0] }; setDraft({ ...draft, platforms: pl }); }} style={{ ...inputStyle, padding: '7px 10px' }}>
                    {Object.keys(PLATFORM_META).map(plat => <option key={plat}>{plat}</option>)}
                  </select>
                  <select value={p.type} onChange={e => { const pl = [...draft.platforms]; pl[pi] = { ...pl[pi], type: e.target.value }; setDraft({ ...draft, platforms: pl }); }} style={{ ...inputStyle, padding: '7px 10px' }}>
                    {(CONTENT_TYPES[p.platform] ?? []).map(t => <option key={t}>{t}</option>)}
                  </select>
                  <input type="number" placeholder="Qty" value={p.qty} onChange={e => { const pl = [...draft.platforms]; const qty = +e.target.value || 1; pl[pi] = { ...pl[pi], qty, done: Array(qty).fill(false) }; setDraft({ ...draft, platforms: pl }); }} style={{ ...inputStyle, padding: '7px 10px' }} />
                  <input type="number" placeholder="Rate" value={p.rate} onChange={e => { const pl = [...draft.platforms]; pl[pi] = { ...pl[pi], rate: +e.target.value }; setDraft({ ...draft, platforms: pl }); }} style={{ ...inputStyle, padding: '7px 10px' }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowAdd(false); setDraft(newDealTemplate()); }} style={{ background: 'transparent', color: T.dim, border: `1px solid ${T.border}`, borderRadius: 3, padding: '9px 20px', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
              <button onClick={addDeal} disabled={saving} style={{ background: T.accent, color: T.bg, border: 'none', borderRadius: 3, padding: '9px 24px', fontWeight: 700, fontSize: 12, cursor: saving ? 'not-allowed' : 'pointer', letterSpacing: 0.8, opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : 'Save Deal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

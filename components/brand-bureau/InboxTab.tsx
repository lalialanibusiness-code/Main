'use client';

import { useState } from 'react';
import { T, PLATFORM_META, fmtMoney, callClaude } from '@/lib/constants';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import type { Deal, Inquiry } from '@/lib/supabase/types';
import type { Profile } from '@/lib/supabase/types';
import { createClient } from '@/lib/supabase/client';

interface Props {
  emails: Inquiry[];
  setEmails: (e: Inquiry[]) => void;
  profile: Profile;
  deals: Deal[];
  setDeals: (d: Deal[]) => void;
  userId: string;
}

export function InboxTab({ emails, setEmails, profile, deals, setDeals, userId }: Props) {
  const supabase = createClient();
  const [sortBy, setSortBy] = useState<'offer' | 'brand' | 'fit'>('offer');
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [replies, setReplies] = useState<Record<string, string>>({});

  const sorted = [...emails].sort((a, b) =>
    sortBy === 'offer' ? b.offer - a.offer
    : sortBy === 'brand' ? a.brand.localeCompare(b.brand)
    : (b.fit_score ?? 0) - (a.fit_score ?? 0)
  );

  const updateEmail = async (id: string, updates: Partial<Inquiry>) => {
    setEmails(emails.map(e => e.id === id ? { ...e, ...updates } : e));
    await supabase.from('inquiries').update(updates).eq('id', id);
  };
  const setLoad = (id: string, key: string, val: boolean) =>
    setLoading(l => ({ ...l, [id + key]: val }));

  const analyze = async (email: Inquiry) => {
    setLoad(email.id, 'analyze', true);
    await updateEmail(email.id, { status: 'Reviewed' });
    const sys = `You are an AI manager for content creator ${profile.name} (${profile.niche}). Brand fit criteria: ${profile.brand_fit}. Rates: ${JSON.stringify(profile.rates)}. Respond EXACTLY in this format:\nFIT_SCORE: [1-10]\nVERDICT: [GREAT FIT / GOOD FIT / LOW BUDGET / NOT A FIT]\nREASON: [one sentence]\nBUDGET: [Above rate / At rate / Below rate / Way below rate]\nACTION: [Accept / Counter / Decline]`;
    try {
      const result = await callClaude(sys, `Email offer $${email.offer} from ${email.brand}:\n${email.body}`);
      const m = result.match(/FIT_SCORE:\s*(\d+)/);
      await updateEmail(email.id, { ai_analysis: result, fit_score: m ? +m[1] : 5 });
    } catch { /* subscription expired — gate handles UI */ }
    setLoad(email.id, 'analyze', false);
  };

  const genReply = async (email: Inquiry, type: 'accept' | 'counter' | 'decline') => {
    setLoad(email.id, type, true);
    const sys = `Write on behalf of ${profile.name}, a ${profile.niche} creator. Platforms: ${profile.platforms}. Tone: ${profile.pitch_tone}. Rates: ${JSON.stringify(profile.rates)}. Write a professional email reply. Sign as ${profile.name}.`;
    const instructions = {
      accept: 'Write an enthusiastic acceptance confirming the deal and asking for contract/next steps.',
      counter: `Their offer $${email.offer} is below our rates. Counter with our rates, justify our value.`,
      decline: 'Graciously decline, keep door open for future.',
    };
    try {
      const result = await callClaude(sys, `Original email:\n${email.body}\n\nTask: ${instructions[type]}`);
      setReplies(r => ({ ...r, [email.id]: result }));
    } catch { /* subscription expired */ }
    setLoad(email.id, type, false);
  };

  const acceptAndCreateDeal = async (email: Inquiry) => {
    const { data: dealRow } = await supabase
      .from('deals')
      .insert({
        user_id: userId, brand: email.brand, niche: email.platform,
        status: 'Active', total_value: email.offer, paid: 0,
        due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        notes: `From: ${email.subject}`, contact: email.from_email, tags: [],
      })
      .select()
      .single();
    if (!dealRow) return;

    const { data: delivRow } = await supabase
      .from('platform_deliverables')
      .insert({ deal_id: dealRow.id, user_id: userId, platform: email.platform, type: email.type, qty: 1, rate: email.offer, done: [false] })
      .select()
      .single();

    setDeals([...deals, { ...dealRow, platform_deliverables: delivRow ? [delivRow] : [] } as Deal]);
    await updateEmail(email.id, { status: 'Accepted' });
    setSelected(null);
  };

  const fitColor = (s: number) => s >= 8 ? T.green : s >= 5 ? T.yellow : T.red;
  const statusColor: Record<string, string> = { Unread: T.yellow, Reviewed: T.blue, Accepted: T.green, Declined: T.red };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 22 }}>
        <span style={{ color: T.dim, fontSize: 11, letterSpacing: 0.5 }}>Sort:</span>
        {([['offer', 'Payment'], ['fit', 'Fit Score'], ['brand', 'Brand']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setSortBy(key)}
            style={{ background: sortBy === key ? T.accent : 'transparent', color: sortBy === key ? T.bg : T.dim, border: `1px solid ${sortBy === key ? T.accent : T.border}`, borderRadius: 3, padding: '5px 14px', fontSize: 11, fontWeight: 600, cursor: 'pointer', letterSpacing: 0.8 }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {sorted.map(email => {
          const isOpen = selected === email.id;
          return (
            <div key={email.id} style={{ background: T.card, border: `1px solid ${isOpen ? T.accentMid : T.border}`, borderLeft: `3px solid ${isOpen ? T.accentMid : T.border}`, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 22px', cursor: 'pointer' }} onClick={() => setSelected(isOpen ? null : email.id)}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontWeight: 700, color: T.text, fontSize: 15, fontFamily: "'Playfair Display', serif" }}>{email.brand}</span>
                    <Badge color={statusColor[email.status] ?? T.dim}>{email.status}</Badge>
                    {email.fit_score && <Badge color={fitColor(email.fit_score)}>Fit {email.fit_score}/10</Badge>}
                  </div>
                  <div style={{ color: T.dim, fontSize: 12, letterSpacing: 0.3 }}>{email.subject}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: T.green, fontWeight: 700, fontSize: 20, fontFamily: "'Playfair Display', serif" }}>{fmtMoney(email.offer)}</div>
                  <div style={{ color: T.dim, fontSize: 11, marginTop: 3 }}>{PLATFORM_META[email.platform]?.icon} {email.platform}</div>
                </div>
              </div>

              {isOpen && (
                <div style={{ borderTop: `1px solid ${T.border}`, padding: '20px 22px', background: T.surface }}>
                  <div style={{ background: T.card, borderRadius: 4, padding: 16, color: T.accentMid, fontSize: 13, lineHeight: 1.8, marginBottom: 18, borderLeft: `3px solid ${T.tanLight}`, fontStyle: 'italic' }}>{email.body}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                    {([
                      { key: 'analyze', label: 'AI Analyze',    bg: T.accent,        co: T.bg },
                      { key: 'accept',  label: 'Draft Accept',  bg: T.green + '20',  co: T.green },
                      { key: 'counter', label: 'Counter Offer', bg: T.yellow + '20', co: T.yellow },
                      { key: 'decline', label: 'Draft Decline', bg: T.red + '20',    co: T.red },
                    ] as const).map(btn => (
                      <button key={btn.key}
                        onClick={() => btn.key === 'analyze' ? analyze(email) : genReply(email, btn.key as 'accept' | 'counter' | 'decline')}
                        disabled={!!loading[email.id + btn.key]}
                        style={{ background: btn.bg, color: btn.co, border: `1px solid ${btn.co}44`, borderRadius: 3, padding: '7px 16px', fontWeight: 700, fontSize: 11, cursor: 'pointer', letterSpacing: 0.8 }}>
                        {loading[email.id + btn.key] ? <Spinner /> : btn.label}
                      </button>
                    ))}
                    <button onClick={() => acceptAndCreateDeal(email)}
                      style={{ background: 'transparent', color: T.blue, border: `1px solid ${T.blue}55`, borderRadius: 3, padding: '7px 16px', fontWeight: 700, fontSize: 11, cursor: 'pointer', marginLeft: 'auto', letterSpacing: 0.8 }}>
                      + Add to Deals
                    </button>
                  </div>
                  {email.ai_analysis && (
                    <div style={{ background: T.tanLight, border: `1px solid ${T.tan}`, borderRadius: 4, padding: 18, marginBottom: 14 }}>
                      <div style={{ color: T.accentLight, fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>AI Analysis</div>
                      <pre style={{ color: T.accentMid, fontSize: 12, lineHeight: 1.9, whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>{email.ai_analysis}</pre>
                    </div>
                  )}
                  {replies[email.id] && (
                    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 4, padding: 18 }}>
                      <div style={{ color: T.accentLight, fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>Draft Reply</div>
                      <textarea defaultValue={replies[email.id]}
                        style={{ width: '100%', background: 'transparent', border: 'none', color: T.accentMid, fontSize: 13, lineHeight: 1.8, resize: 'vertical', minHeight: 160, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                      <button onClick={() => navigator.clipboard?.writeText(replies[email.id])}
                        style={{ background: T.tanLight, color: T.dim, border: `1px solid ${T.border}`, borderRadius: 3, padding: '5px 14px', fontSize: 11, cursor: 'pointer', marginTop: 8 }}>
                        Copy
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

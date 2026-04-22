'use client';

import { useState } from 'react';
import { T } from '@/lib/constants';
import type { Profile } from '@/lib/supabase/types';
import { createClient } from '@/lib/supabase/client';

interface Props { profile: Profile; setProfile: (p: Profile) => void; }

export function ProfileTab({ profile, setProfile }: Props) {
  const supabase = createClient();
  const [draft, setDraft] = useState(profile);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      name: draft.name, niche: draft.niche, platforms: draft.platforms,
      brand_fit: draft.brand_fit, pitch_tone: draft.pitch_tone, rates: draft.rates,
    }).eq('id', profile.id);
    setSaving(false);
    if (!error) {
      setProfile(draft);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 3,
    padding: '10px 14px', color: T.text, fontSize: 13, resize: 'vertical', minHeight: 44,
    boxSizing: 'border-box', lineHeight: 1.6, fontFamily: 'inherit', outline: 'none',
  };
  const labelStyle: React.CSSProperties = {
    color: T.dim, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: 7,
  };

  return (
    <div style={{ maxWidth: 660 }}>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 4, padding: 30, marginBottom: 18 }}>
        <h3 style={{ color: T.text, fontFamily: "'Playfair Display', serif", margin: '0 0 24px', fontSize: 20 }}>Creator Profile</h3>
        {([['Creator Name', 'name'], ['Niche / Category', 'niche'], ['Platforms & Audience', 'platforms'], ['Brand Fit Criteria', 'brand_fit'], ['Pitch Tone & Voice', 'pitch_tone']] as const).map(([label, key]) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <label style={labelStyle}>{label}</label>
            <textarea value={draft[key]} onChange={e => setDraft({ ...draft, [key]: e.target.value })} style={inputStyle} />
          </div>
        ))}
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 4, padding: 30, marginBottom: 18 }}>
        <h3 style={{ color: T.text, fontFamily: "'Playfair Display', serif", margin: '0 0 24px', fontSize: 20 }}>Rate Card</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {Object.entries(draft.rates).map(([type, rate]) => (
            <div key={type} style={{ background: T.surface, borderRadius: 3, padding: '14px 18px', borderLeft: `3px solid ${T.tan}` }}>
              <div style={{ color: T.dim, fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>{type}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ color: T.dim, fontSize: 16 }}>$</span>
                <input type="number" value={rate}
                  onChange={e => setDraft({ ...draft, rates: { ...draft.rates, [type]: +e.target.value } })}
                  style={{ background: 'transparent', border: 'none', color: T.accentMid, fontWeight: 700, fontSize: 22, width: '100%', outline: 'none', fontFamily: "'Playfair Display', serif" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={save} disabled={saving}
        style={{ background: T.accent, color: T.bg, border: 'none', borderRadius: 3, padding: '12px 34px', fontWeight: 700, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer', letterSpacing: 1, opacity: saving ? 0.7 : 1 }}>
        {saving ? 'Saving…' : saved ? '✓  Saved' : 'Save Profile'}
      </button>
    </div>
  );
}

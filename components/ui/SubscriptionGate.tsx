'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Profile } from '@/lib/supabase/types';

const T = {
  bg: '#F5F0E8', card: '#FAF7F2', border: '#D9CFBC', accent: '#1A1008',
  accentMid: '#3D2B1A', tan: '#C4A882', tanLight: '#E2D5C0',
  text: '#1A1008', dim: '#7A6A52', yellow: '#B8860B',
};

interface Props {
  profile: Profile;
  children: React.ReactNode;
}

export function SubscriptionGate({ profile, children }: Props) {
  const [loading, setLoading] = useState(false);

  const isTrialing = profile.subscription_status === 'trialing'
    && new Date(profile.trial_ends_at) > new Date();
  const isActive = profile.subscription_status === 'active';
  const hasAccess = isTrialing || isActive;

  const trialDaysLeft = isTrialing
    ? Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / 86400000)
    : 0;

  const handleCheckout = async () => {
    setLoading(true);
    const res = await fetch('/api/stripe/checkout', { method: 'POST' });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setLoading(false);
  };

  if (hasAccess) {
    return (
      <>
        {isTrialing && trialDaysLeft <= 3 && (
          <div style={{ background: T.yellow + '18', border: `1px solid ${T.yellow}55`, borderRadius: 4, padding: '12px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ color: T.accentMid, fontSize: 13 }}>
              ⏰ Your free trial ends in <strong>{trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''}</strong>.
            </span>
            <button onClick={handleCheckout} disabled={loading}
              style={{ background: T.accent, color: T.bg, border: 'none', borderRadius: 3, padding: '7px 18px', fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.8 }}>
              {loading ? 'Loading…' : 'Subscribe now →'}
            </button>
          </div>
        )}
        {children}
      </>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 32 }}>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 6, padding: '48px 44px', maxWidth: 440, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 20 }}>◎</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: T.text, marginBottom: 14 }}>
          Subscription required
        </h2>
        <p style={{ color: T.dim, fontSize: 14, lineHeight: 1.75, marginBottom: 32 }}>
          {profile.subscription_status === 'past_due'
            ? 'Your payment failed. Please update your billing details to continue.'
            : 'Your free trial has ended. Subscribe to keep access to The Brand Bureau.'}
        </p>
        <button onClick={handleCheckout} disabled={loading}
          style={{ width: '100%', background: T.accent, color: T.bg, border: 'none', borderRadius: 3, padding: '14px', fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: 0.8, marginBottom: 14, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Loading…' : 'Subscribe — $29/month →'}
        </button>
        <Link href="/billing" style={{ color: T.dim, fontSize: 12, textDecoration: 'none' }}>
          Manage billing
        </Link>
      </div>
    </div>
  );
}

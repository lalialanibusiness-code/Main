'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Profile } from '@/lib/supabase/types';

const T = {
  bg: '#F5F0E8', surface: '#EDE7D9', card: '#FAF7F2', border: '#D9CFBC',
  accent: '#1A1008', accentMid: '#3D2B1A', tan: '#C4A882', tanLight: '#E2D5C0',
  text: '#1A1008', dim: '#7A6A52', green: '#4A7C59', yellow: '#B8860B', red: '#8B3A3A',
};

const STATUS_LABEL: Record<string, string> = {
  trialing: 'Free Trial',
  active: 'Active',
  past_due: 'Past Due',
  canceled: 'Canceled',
  incomplete: 'Incomplete',
};
const STATUS_COLOR: Record<string, string> = {
  trialing: T.yellow,
  active: T.green,
  past_due: T.red,
  canceled: T.dim,
  incomplete: T.red,
};

export default function BillingClient({ profile }: { profile: Profile }) {
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const openPortal = async () => {
    setPortalLoading(true);
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setPortalLoading(false);
  };

  const startCheckout = async () => {
    setCheckoutLoading(true);
    const res = await fetch('/api/stripe/checkout', { method: 'POST' });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setCheckoutLoading(false);
  };

  const isTrialing = profile.subscription_status === 'trialing';
  const isActive = profile.subscription_status === 'active';
  const trialDaysLeft = isTrialing
    ? Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / 86400000)
    : 0;

  return (
    <div style={{ minHeight: '100vh', background: T.bg, padding: '60px 32px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <Link href="/dashboard" style={{ color: T.dim, fontSize: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
          ← Back to dashboard
        </Link>

        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 28, color: T.text, marginBottom: 8 }}>Billing</div>
        <div style={{ color: T.dim, fontSize: 14, marginBottom: 36 }}>Manage your subscription and payment details.</div>

        {/* Status card */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 5, padding: '28px 28px 24px', marginBottom: 18 }}>
          <div style={{ color: T.dim, fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: 700, marginBottom: 18 }}>Current plan</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: T.text }}>The Brand Bureau Pro</div>
              <div style={{ color: T.dim, fontSize: 13, marginTop: 5 }}>$29 / month</div>
            </div>
            <span style={{ background: STATUS_COLOR[profile.subscription_status] + '18', color: STATUS_COLOR[profile.subscription_status], border: `1px solid ${STATUS_COLOR[profile.subscription_status]}55`, borderRadius: 3, padding: '4px 12px', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              {STATUS_LABEL[profile.subscription_status] ?? profile.subscription_status}
            </span>
          </div>

          {isTrialing && (
            <div style={{ background: T.tanLight, borderRadius: 3, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: T.accentMid }}>
              ⏰ Your free trial ends in <strong>{Math.max(0, trialDaysLeft)} day{trialDaysLeft !== 1 ? 's' : ''}</strong>.
              You won't be charged until your trial ends.
            </div>
          )}

          {profile.current_period_end && isActive && (
            <div style={{ color: T.dim, fontSize: 12, marginBottom: 20 }}>
              Next billing date: <strong style={{ color: T.text }}>{new Date(profile.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {(isActive || isTrialing) && profile.stripe_customer_id ? (
              <button onClick={openPortal} disabled={portalLoading}
                style={{ background: T.accent, color: T.bg, border: 'none', borderRadius: 3, padding: '11px 24px', fontWeight: 700, fontSize: 12, cursor: portalLoading ? 'not-allowed' : 'pointer', letterSpacing: 0.8, opacity: portalLoading ? 0.7 : 1 }}>
                {portalLoading ? 'Loading…' : 'Manage billing & invoices →'}
              </button>
            ) : (
              <button onClick={startCheckout} disabled={checkoutLoading}
                style={{ background: T.accent, color: T.bg, border: 'none', borderRadius: 3, padding: '11px 24px', fontWeight: 700, fontSize: 12, cursor: checkoutLoading ? 'not-allowed' : 'pointer', letterSpacing: 0.8, opacity: checkoutLoading ? 0.7 : 1 }}>
                {checkoutLoading ? 'Loading…' : 'Subscribe — $29/month →'}
              </button>
            )}
          </div>
        </div>

        {/* Account info */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 5, padding: '24px 28px' }}>
          <div style={{ color: T.dim, fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: 700, marginBottom: 16 }}>Account</div>
          <div style={{ color: T.text, fontSize: 14, marginBottom: 8 }}>{profile.name}</div>
          <div style={{ color: T.dim, fontSize: 13 }}>{profile.email}</div>
        </div>
      </div>
    </div>
  );
}

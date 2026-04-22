'use client';

import { useState } from 'react';
import Link from 'next/link';
import { T, TABS } from '@/lib/constants';
import { SubscriptionGate } from '@/components/ui/SubscriptionGate';
import { DashboardTab } from './DashboardTab';
import { DealsTab } from './DealsTab';
import { TasksTab } from './TasksTab';
import { InboxTab } from './InboxTab';
import { IncomeTab } from './IncomeTab';
import { ProfileTab } from './ProfileTab';
import type { Deal, Inquiry, Profile } from '@/lib/supabase/types';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Props {
  initialDeals: Deal[];
  initialEmails: Inquiry[];
  profile: Profile;
}

export function CreatorOS({ initialDeals, initialEmails, profile: initialProfile }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [tab, setTab] = useState<string>('dashboard');
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [emails, setEmails] = useState<Inquiry[]>(initialEmails);
  const [profile, setProfile] = useState<Profile>(initialProfile);

  const pendingCount = deals
    .flatMap(d => d.platform_deliverables ?? [])
    .flatMap(p => p.done)
    .filter(d => !d).length;

  const unreadCount = emails.filter(e => e.status === 'Unread').length;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const currentTab = TABS.find(t => t.id === tab);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: "'DM Sans', sans-serif" }}>
      {/* Sidebar */}
      <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 210, background: T.accent, display: 'flex', flexDirection: 'column', zIndex: 100 }}>
        <div style={{ padding: '32px 26px 28px', borderBottom: '1px solid #ffffff18' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 16, color: T.bg, letterSpacing: 0.5, lineHeight: 1.3 }}>
            THE BRAND<br />
            <span style={{ fontWeight: 400, fontSize: 15, letterSpacing: 2, opacity: 0.75 }}>BUREAU</span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '20px 14px' }}>
          {TABS.map(t => {
            const badge = t.id === 'tasks' ? pendingCount : t.id === 'inbox' ? unreadCount : 0;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 3, border: 'none', background: active ? T.bg + '18' : 'transparent', color: active ? T.bg : T.bg + '88', fontWeight: active ? 600 : 400, fontSize: 12, cursor: 'pointer', marginBottom: 2, transition: 'all 0.15s', textAlign: 'left', letterSpacing: 0.8 }}>
                <span style={{ opacity: 0.7, fontSize: 10 }}>{t.icon}</span>
                <span style={{ flex: 1, textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 10 }}>{t.label}</span>
                {badge > 0 && <span style={{ background: T.yellow, color: T.accent, borderRadius: 2, padding: '1px 6px', fontSize: 9, fontWeight: 800 }}>{badge}</span>}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '16px 14px 14px', borderTop: '1px solid #ffffff18', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ padding: '6px 14px' }}>
            <div style={{ color: T.bg, fontWeight: 600, fontSize: 12, letterSpacing: 0.5, opacity: 0.9 }}>{profile.name}</div>
            <div style={{ color: T.bg + '66', fontSize: 10, marginTop: 2, letterSpacing: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.niche}</div>
          </div>
          <Link href="/billing"
            style={{ display: 'block', color: T.bg + '66', fontSize: 10, letterSpacing: 1.2, padding: '6px 14px', textDecoration: 'none', textTransform: 'uppercase', transition: 'color 0.15s' }}>
            Billing
          </Link>
          <button onClick={handleSignOut}
            style={{ background: 'transparent', border: 'none', color: T.bg + '55', fontSize: 10, letterSpacing: 1.2, padding: '6px 14px', cursor: 'pointer', textAlign: 'left', textTransform: 'uppercase' }}>
            Sign out
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: 210, padding: '40px 48px', minHeight: '100vh' }}>
        <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: `1px solid ${T.border}` }}>
          <div style={{ color: T.dim, fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>
            The Brand Bureau · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 32, color: T.text, letterSpacing: -0.5 }}>
            {currentTab?.label}
          </h1>
        </div>

        <SubscriptionGate profile={profile}>
          {tab === 'dashboard' && <DashboardTab deals={deals} emails={emails} />}
          {tab === 'deals'     && <DealsTab deals={deals} setDeals={setDeals} userId={profile.id} />}
          {tab === 'tasks'     && <TasksTab deals={deals} setDeals={setDeals} />}
          {tab === 'inbox'     && <InboxTab emails={emails} setEmails={setEmails} profile={profile} deals={deals} setDeals={setDeals} userId={profile.id} />}
          {tab === 'income'    && <IncomeTab deals={deals} />}
          {tab === 'profile'   && <ProfileTab profile={profile} setProfile={setProfile} />}
        </SubscriptionGate>
      </div>
    </div>
  );
}

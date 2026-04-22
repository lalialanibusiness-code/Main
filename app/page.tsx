import Link from 'next/link';
import { PLANS } from '@/lib/stripe';

const T = {
  bg: '#F5F0E8', surface: '#EDE7D9', card: '#FAF7F2', border: '#D9CFBC',
  accent: '#1A1008', accentMid: '#3D2B1A', accentLight: '#6B4C32',
  tan: '#C4A882', tanLight: '#E2D5C0', green: '#4A7C59', yellow: '#B8860B',
  red: '#8B3A3A', blue: '#3A5A7C', text: '#1A1008', dim: '#7A6A52', dimmer: '#C4B49A',
};

const features = [
  {
    icon: '◈',
    title: 'Deal Pipeline Dashboard',
    body: 'See every active deal, outstanding payment, and upcoming deadline at a glance. Know exactly where each partnership stands.',
  },
  {
    icon: '◻',
    title: 'Brand Deal Manager',
    body: 'Track brands, contracts, payment splits, and per-platform deliverables. Never lose track of what you owe a brand.',
  },
  {
    icon: '◇',
    title: 'Deliverables Task Board',
    body: 'Check off each Reel, Story, and video as you post it. Visual progress bars keep every campaign on schedule.',
  },
  {
    icon: '◁',
    title: 'AI-Powered Inbox',
    body: 'Paste a brand email and get an instant fit score, budget analysis, and a ready-to-send accept, counter, or decline draft — powered by Claude.',
  },
  {
    icon: '◎',
    title: 'Revenue Tracker',
    body: 'See total contracted value, cash received, and what's still owed — broken down by brand and platform. Built-in payment schedule.',
  },
  {
    icon: '◉',
    title: 'Creator Profile & Rate Card',
    body: 'Store your niche, platforms, brand-fit criteria, and exact rates. The AI uses all of it to personalize every analysis and draft.',
  },
];

const testimonials = [
  {
    quote: 'I was tracking deals in a notes app. The Brand Bureau turned my inbox chaos into an actual business.',
    name: 'Ava M.',
    handle: '@avamakes · 340k Instagram',
  },
  {
    quote: 'The AI inbox alone saves me two hours a week. It flags low-budget offers instantly and writes the counter for me.',
    name: 'Jordan K.',
    handle: '@jordankfit · 180k TikTok',
  },
  {
    quote: 'Finally know what I'm owed vs. what I've been paid. The revenue dashboard changed how I invoice.',
    name: 'Sofia R.',
    handle: '@sofiatravels · 95k YouTube',
  },
];

export default function LandingPage() {
  const price = (PLANS.pro.amount / 100).toFixed(0);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Nav ── */}
      <nav style={{ borderBottom: `1px solid ${T.border}`, background: T.bg, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 17, color: T.accent, letterSpacing: 0.5 }}>
            THE BRAND <span style={{ fontWeight: 400, opacity: 0.65 }}>BUREAU</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link href="/login" style={{ color: T.dim, textDecoration: 'none', fontSize: 13, fontWeight: 500, padding: '8px 16px' }}>
              Log in
            </Link>
            <Link href="/signup" style={{ background: T.accent, color: T.bg, textDecoration: 'none', fontSize: 12, fontWeight: 700, padding: '9px 22px', borderRadius: 3, letterSpacing: 0.8 }}>
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '100px 32px 80px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: T.tanLight, color: T.accentLight, border: `1px solid ${T.tan}`, borderRadius: 3, padding: '4px 14px', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 32 }}>
          7-day free trial · No credit card required
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(40px, 6vw, 68px)', fontWeight: 700, lineHeight: 1.1, color: T.text, marginBottom: 28, letterSpacing: -1 }}>
          Run your brand deals<br />
          <em style={{ fontStyle: 'italic', color: T.accentLight }}>like a business.</em>
        </h1>
        <p style={{ fontSize: 18, color: T.dim, lineHeight: 1.8, maxWidth: 560, margin: '0 auto 44px', fontWeight: 400 }}>
          The Brand Bureau is the editorial-grade deal management platform built for creators who are serious about their income. Track campaigns, analyze offers with AI, and never leave money on the table.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup" style={{ background: T.accent, color: T.bg, textDecoration: 'none', fontSize: 14, fontWeight: 700, padding: '15px 36px', borderRadius: 3, letterSpacing: 0.8, display: 'inline-block' }}>
            Start your free trial →
          </Link>
          <a href="#features" style={{ background: 'transparent', color: T.accentMid, textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '15px 28px', borderRadius: 3, border: `1px solid ${T.border}`, display: 'inline-block' }}>
            See how it works
          </a>
        </div>
      </section>

      {/* ── App preview strip ── */}
      <section style={{ background: T.accent, padding: '48px 0', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { label: 'Avg deal value tracked', value: '$4,200' },
              { label: 'AI inbox analyses', value: '2 hrs/wk saved' },
              { label: 'Payment collection rate', value: '98%' },
              { label: 'Platforms supported', value: '5+' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 700, color: T.bg, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ color: T.bg + '77', fontSize: 11, marginTop: 8, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ maxWidth: 1120, margin: '0 auto', padding: '96px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ color: T.dim, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>Everything you need</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: T.text, letterSpacing: -0.5 }}>
            Your brand deal business,<br />finally under control.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {features.map(f => (
            <div key={f.title} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 4, padding: '28px 28px 26px' }}>
              <div style={{ fontSize: 22, marginBottom: 16, color: T.accentLight }}>{f.icon}</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ color: T.dim, fontSize: 14, lineHeight: 1.75 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ background: T.surface, padding: '80px 32px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ color: T.dim, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>Creators love it</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 700, color: T.text }}>Built for creators, by creators.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {testimonials.map(t => (
              <div key={t.name} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 4, padding: '28px 26px' }}>
                <div style={{ color: T.accentLight, fontSize: 28, lineHeight: 1, marginBottom: 14, fontFamily: 'Georgia, serif' }}>"</div>
                <p style={{ color: T.accentMid, fontSize: 15, lineHeight: 1.8, fontStyle: 'italic', marginBottom: 20 }}>{t.quote}</p>
                <div>
                  <div style={{ color: T.text, fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                  <div style={{ color: T.dim, fontSize: 11, marginTop: 3, letterSpacing: 0.3 }}>{t.handle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ maxWidth: 1120, margin: '0 auto', padding: '96px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ color: T.dim, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>Simple pricing</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: T.text, letterSpacing: -0.5, marginBottom: 16 }}>
            One plan. Full access.
          </h2>
          <p style={{ color: T.dim, fontSize: 16, maxWidth: 420, margin: '0 auto' }}>Try free for 7 days. Cancel anytime — no hassle, no questions.</p>
        </div>

        <div style={{ maxWidth: 440, margin: '0 auto' }}>
          <div style={{ background: T.accent, borderRadius: 6, padding: '44px 40px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 20, right: 20, background: T.yellow, color: T.accent, borderRadius: 3, padding: '4px 12px', fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              7-day free trial
            </div>
            <div style={{ color: T.bg + '88', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>The Brand Bureau</div>
            <div style={{ fontFamily: "'Playfair Display', serif", color: T.bg, fontWeight: 700, fontSize: 18, marginBottom: 24 }}>Pro</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 32 }}>
              <span style={{ fontFamily: "'Playfair Display', serif", color: T.bg, fontSize: 52, fontWeight: 700, lineHeight: 1 }}>${price}</span>
              <span style={{ color: T.bg + '77', fontSize: 14 }}>/month</span>
            </div>
            <div style={{ borderTop: `1px solid ${T.bg + '22'}`, paddingTop: 28, marginBottom: 32 }}>
              {PLANS.pro.features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <span style={{ color: T.yellow, fontSize: 12, flexShrink: 0 }}>✓</span>
                  <span style={{ color: T.bg + 'cc', fontSize: 14 }}>{f}</span>
                </div>
              ))}
            </div>
            <Link href="/signup" style={{ display: 'block', background: T.bg, color: T.accent, textDecoration: 'none', fontSize: 13, fontWeight: 800, padding: '16px', borderRadius: 3, letterSpacing: 1, textAlign: 'center', width: '100%' }}>
              Start free trial →
            </Link>
            <p style={{ color: T.bg + '55', fontSize: 11, textAlign: 'center', marginTop: 14, letterSpacing: 0.3 }}>
              No credit card needed to start. ${price}/month after trial.
            </p>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ background: T.surface, borderTop: `1px solid ${T.border}`, padding: '80px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, color: T.text, marginBottom: 20, letterSpacing: -0.5 }}>
            Your deals deserve better than a spreadsheet.
          </h2>
          <p style={{ color: T.dim, fontSize: 16, lineHeight: 1.8, marginBottom: 36 }}>
            Join creators who treat their brand partnerships like the business they are.
          </p>
          <Link href="/signup" style={{ background: T.accent, color: T.bg, textDecoration: 'none', fontSize: 14, fontWeight: 700, padding: '16px 40px', borderRadius: 3, letterSpacing: 0.8, display: 'inline-block' }}>
            Start your free trial →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${T.border}`, padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 14, color: T.accentMid }}>
          THE BRAND <span style={{ fontWeight: 400, opacity: 0.65 }}>BUREAU</span>
        </div>
        <div style={{ display: 'flex', gap: 28 }}>
          {[['Log in', '/login'], ['Sign up', '/signup'], ['Pricing', '#pricing']].map(([label, href]) => (
            <a key={label} href={href} style={{ color: T.dim, textDecoration: 'none', fontSize: 12, fontWeight: 500 }}>{label}</a>
          ))}
        </div>
        <div style={{ color: T.dimmer, fontSize: 11 }}>© {new Date().getFullYear()} The Brand Bureau</div>
      </footer>
    </div>
  );
}

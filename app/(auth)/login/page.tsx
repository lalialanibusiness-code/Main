'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const T = {
  bg: '#F5F0E8', card: '#FAF7F2', border: '#D9CFBC', accent: '#1A1008',
  accentMid: '#3D2B1A', tanLight: '#E2D5C0', tan: '#C4A882',
  text: '#1A1008', dim: '#7A6A52', red: '#8B3A3A',
};

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#EDE7D9', border: `1px solid ${T.border}`, borderRadius: 3,
    padding: '11px 14px', color: T.text, fontSize: 14, outline: 'none', fontFamily: 'inherit',
  };
  const labelStyle: React.CSSProperties = {
    color: T.dim, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 7,
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 20, color: T.accent, letterSpacing: 0.5 }}>
              THE BRAND <span style={{ fontWeight: 400, opacity: 0.65 }}>BUREAU</span>
            </div>
          </Link>
        </div>

        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 5, padding: '40px 36px' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: T.text, marginBottom: 28, textAlign: 'center' }}>
            Welcome back
          </h1>

          {error && (
            <div style={{ background: T.red + '12', border: `1px solid ${T.red}44`, borderRadius: 3, padding: '10px 14px', color: T.red, fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} required autoComplete="email" placeholder="you@example.com" />
            </div>
            <div style={{ marginBottom: 26 }}>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} required autoComplete="current-password" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', background: T.accent, color: T.bg, border: 'none', borderRadius: 3, padding: '13px', fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: 0.8, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, color: T.dim, fontSize: 13 }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: T.accentMid, fontWeight: 600, textDecoration: 'none' }}>Start free trial</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

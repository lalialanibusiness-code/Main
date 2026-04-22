export const T = {
  bg: '#F5F0E8', surface: '#EDE7D9', card: '#FAF7F2', border: '#D9CFBC',
  borderHover: '#BFB39A', accent: '#1A1008', accentMid: '#3D2B1A',
  accentLight: '#6B4C32', tan: '#C4A882', tanLight: '#E2D5C0',
  green: '#4A7C59', yellow: '#B8860B', red: '#8B3A3A', blue: '#3A5A7C',
  pink: '#8B5A6B', orange: '#8B5E3C', text: '#1A1008', dim: '#7A6A52', dimmer: '#C4B49A',
} as const;

export const PLATFORM_META: Record<string, { icon: string; color: string }> = {
  Instagram: { icon: '📸', color: T.pink },
  TikTok:    { icon: '🎵', color: T.accent },
  YouTube:   { icon: '▶️', color: T.red },
  Twitter:   { icon: '𝕏',  color: T.blue },
  Podcast:   { icon: '🎙️', color: T.orange },
};

export const CONTENT_TYPES: Record<string, string[]> = {
  Instagram: ['Reel', 'Static Post', 'Story (x3)', 'Carousel', 'Story + Link'],
  TikTok:    ['Video', 'Duet', 'Stitch', 'Series (x3)'],
  YouTube:   ['Dedicated Video', 'Integration (60s)', 'Short', 'Community Post'],
  Twitter:   ['Tweet Thread', 'Single Tweet', 'Pinned Tweet'],
  Podcast:   ['Host Read (30s)', 'Host Read (60s)', 'Episode Sponsor'],
};

export const TABS = [
  { id: 'dashboard', label: 'Overview',     icon: '◈' },
  { id: 'deals',     label: 'Brand Deals',  icon: '◻' },
  { id: 'tasks',     label: 'Deliverables', icon: '◇' },
  { id: 'inbox',     label: 'Inbox',        icon: '◁' },
  { id: 'income',    label: 'Revenue',      icon: '◎' },
  { id: 'profile',   label: 'Profile',      icon: '◉' },
] as const;

export function fmtMoney(n: number) { return '$' + Number(n).toLocaleString(); }
export function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
export function daysUntil(d: string) { return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000); }

export async function callClaude(system: string, user: string): Promise<string> {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, user }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.text ?? '';
}

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CreatorOS } from '@/components/brand-bureau/CreatorOS';
import type { Deal, Inquiry, Profile } from '@/lib/supabase/types';

async function seedDemoData(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const DEMO_DEALS = [
    {
      brand: 'GlowSkin Co.', niche: 'Skincare', status: 'Active', total_value: 3800, paid: 1900,
      due_date: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
      notes: 'Use code GLOW20 in bio link. Send content 48h before posting for approval.',
      contact: 'sarah@glowskinco.com', tags: ['Beauty', 'Skincare'],
      deliverables: [
        { platform: 'Instagram', type: 'Reel',       qty: 2, rate: 700,  done: [true, false] },
        { platform: 'Instagram', type: 'Story (x3)', qty: 1, rate: 600,  done: [true] },
        { platform: 'TikTok',    type: 'Video',       qty: 2, rate: 900,  done: [false, false] },
      ],
    },
    {
      brand: 'WanderLust Travel', niche: 'Travel', status: 'Active', total_value: 7000, paid: 3500,
      due_date: new Date(Date.now() + 70 * 86400000).toISOString().split('T')[0],
      notes: 'Bali press trip content. Tag @wanderlusttravelio in all posts.',
      contact: 'marco@wanderlust.io', tags: ['Travel', 'Lifestyle'],
      deliverables: [
        { platform: 'Instagram', type: 'Reel',              qty: 2, rate: 1000, done: [true, false] },
        { platform: 'YouTube',   type: 'Integration (60s)', qty: 1, rate: 3000, done: [false] },
        { platform: 'Instagram', type: 'Story (x3)',        qty: 2, rate: 500,  done: [true, false] },
      ],
    },
    {
      brand: 'Bloom Coffee', niche: 'Food & Drink', status: 'Completed', total_value: 1800, paid: 1800,
      due_date: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
      notes: 'Campaign completed. Invoice paid in full.', contact: 'team@bloomcoffee.com', tags: ['Food'],
      deliverables: [
        { platform: 'TikTok',    type: 'Video',       qty: 2, rate: 600, done: [true, true] },
        { platform: 'Instagram', type: 'Static Post', qty: 1, rate: 600, done: [true] },
      ],
    },
  ];

  const DEMO_EMAILS = [
    { brand: 'FitFuel Nutrition', from_email: 'pr@fitfuel.com', subject: 'Ambassador Opportunity – $4,200', offer: 4200, platform: 'Instagram', type: 'Reel', status: 'Unread', body: "Hi! We'd love 3 IG Reels + 6 Stories for our new pre-workout launch. Budget: $4,200 flat. 30-day campaign." },
    { brand: 'Luminary Candles',  from_email: 'brand@luminary.co', subject: 'Holiday Campaign – Home Decor', offer: 2600, platform: 'Instagram', type: 'Reel', status: 'Unread', body: "We're seeking lifestyle creators for our holiday candle campaign. 2 IG Reels + 4 Stories. $2,600 total." },
    { brand: 'PodBoost App',      from_email: 'hello@podboost.io', subject: 'Podcast sponsorship – $1,800/ep', offer: 1800, platform: 'Podcast', type: 'Host Read (60s)', status: 'Unread', body: "We'd love to sponsor 3 episodes of your podcast at $1,800 each. Host-read 60s mid-roll." },
  ];

  for (const d of DEMO_DEALS) {
    const { deliverables, ...dealData } = d;
    const { data: dealRow } = await supabase
      .from('deals').insert({ ...dealData, user_id: userId }).select().single();
    if (!dealRow) continue;
    for (const deliv of deliverables) {
      await supabase.from('platform_deliverables')
        .insert({ ...deliv, deal_id: dealRow.id, user_id: userId });
    }
  }
  for (const e of DEMO_EMAILS) {
    await supabase.from('inquiries').insert({ ...e, user_id: userId });
  }
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single();
  if (!profile) redirect('/login');

  // Fetch deals with deliverables
  const { data: dealsRaw } = await supabase
    .from('deals').select('*, platform_deliverables(*)').eq('user_id', user.id).order('created_at', { ascending: false });

  const deals: Deal[] = (dealsRaw ?? []) as Deal[];

  // Seed demo data for brand-new users with no deals
  if (deals.length === 0) {
    await seedDemoData(supabase, user.id);
    const { data: seededDeals } = await supabase
      .from('deals').select('*, platform_deliverables(*)').eq('user_id', user.id).order('created_at', { ascending: false });
    const { data: seededEmails } = await supabase
      .from('inquiries').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    return <CreatorOS initialDeals={(seededDeals ?? []) as Deal[]} initialEmails={(seededEmails ?? []) as Inquiry[]} profile={profile as Profile} />;
  }

  const { data: emails } = await supabase
    .from('inquiries').select('*').eq('user_id', user.id).order('created_at', { ascending: false });

  return <CreatorOS initialDeals={deals} initialEmails={(emails ?? []) as Inquiry[]} profile={profile as Profile} />;
}

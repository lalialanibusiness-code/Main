import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(request: NextRequest) {
  // Gate behind auth + active subscription
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, trial_ends_at')
    .eq('id', user.id)
    .single();

  const isTrialing = profile?.subscription_status === 'trialing'
    && new Date(profile.trial_ends_at) > new Date();
  const isActive = profile?.subscription_status === 'active';

  if (!isTrialing && !isActive) {
    return NextResponse.json({ error: 'Subscription required' }, { status: 402 });
  }

  const { system, user: userMessage } = await request.json();

  if (!system || !userMessage) {
    return NextResponse.json({ error: 'Missing system or user message' }, { status: 400 });
  }

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    system,
    messages: [{ role: 'user', content: userMessage }],
  });

  const text = message.content
    .filter(b => b.type === 'text')
    .map(b => (b as { type: 'text'; text: string }).text)
    .join('');

  return NextResponse.json({ text });
}

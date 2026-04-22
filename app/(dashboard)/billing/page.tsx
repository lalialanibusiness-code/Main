import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BillingClient from './BillingClient';
import type { Profile } from '@/lib/supabase/types';

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login');

  return <BillingClient profile={profile as Profile} />;
}

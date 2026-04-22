import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

// Stripe requires the raw body to validate signatures
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Webhook signature verification failed: ${msg}` }, { status: 400 });
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.subscription_data?.metadata?.supabase_user_id
        ?? (session as any).metadata?.supabase_user_id;
      if (!userId || !session.subscription) break;

      const sub = await stripe.subscriptions.retrieve(session.subscription as string);
      await syncSubscription(supabase, userId, sub);
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      if (!userId) break;
      await syncSubscription(supabase, userId, sub);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();
      if (data) {
        await supabase
          .from('profiles')
          .update({ subscription_status: 'past_due' })
          .eq('id', data.id);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

async function syncSubscription(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  sub: Stripe.Subscription
) {
  const status = sub.status as string;
  const periodEnd = new Date(sub.current_period_end * 1000).toISOString();

  await supabase
    .from('profiles')
    .update({
      subscription_status: status,
      stripe_subscription_id: sub.id,
      current_period_end: periodEnd,
    })
    .eq('id', userId);
}

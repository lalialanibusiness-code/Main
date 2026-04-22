import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export const PLANS = {
  pro: {
    name: 'The Brand Bureau Pro',
    description: 'Full access for serious creators',
    priceId: process.env.STRIPE_PRICE_ID_PRO_MONTHLY!,
    amount: 2900, // $29.00 in cents
    interval: 'month' as const,
    trialDays: 7,
    features: [
      'Unlimited brand deal tracking',
      'AI-powered deal analysis & reply drafts',
      'Full deliverables task board',
      'Revenue & pipeline dashboard',
      'Smart inquiry inbox',
      'Creator profile & rate card',
    ],
  },
} as const;

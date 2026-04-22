export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete';

export interface Profile {
  id: string;
  email: string | null;
  name: string;
  niche: string;
  platforms: string;
  brand_fit: string;
  pitch_tone: string;
  rates: Record<string, number>;
  subscription_status: SubscriptionStatus;
  subscription_tier: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  trial_ends_at: string;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  user_id: string;
  brand: string;
  niche: string;
  status: 'Active' | 'Negotiating' | 'Completed' | 'Declined';
  total_value: number;
  paid: number;
  due_date: string | null;
  notes: string;
  contact: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  platform_deliverables?: PlatformDeliverable[];
}

export interface PlatformDeliverable {
  id: string;
  deal_id: string;
  user_id: string;
  platform: string;
  type: string;
  qty: number;
  rate: number;
  done: boolean[];
  sort_order: number;
}

export interface Inquiry {
  id: string;
  user_id: string;
  brand: string;
  from_email: string;
  subject: string;
  body: string;
  offer: number;
  platform: string;
  type: string;
  status: 'Unread' | 'Reviewed' | 'Accepted' | 'Declined';
  fit_score: number | null;
  ai_analysis: string | null;
  created_at: string;
}

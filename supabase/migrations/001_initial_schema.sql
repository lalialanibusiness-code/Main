-- ─────────────────────────────────────────────────────────────────────────────
-- The Brand Bureau — Initial Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. PROFILES ──────────────────────────────────────────────────────────────
-- One row per auth user. Auto-created on signup via trigger.
create table if not exists public.profiles (
  id                     uuid primary key references auth.users(id) on delete cascade,
  email                  text,
  name                   text not null default 'Creator',
  niche                  text not null default 'Lifestyle',
  platforms              text not null default '',
  brand_fit              text not null default '',
  pitch_tone             text not null default 'Warm, creative, professional.',
  rates                  jsonb not null default '{
    "Instagram Reel": 1400,
    "Instagram Static Post": 800,
    "Instagram Story (x3)": 500,
    "TikTok Video": 900,
    "YouTube Dedicated Video": 3500,
    "YouTube Integration (60s)": 2200
  }'::jsonb,
  -- Subscription fields (written by Stripe webhook via service-role key)
  subscription_status    text not null default 'trialing'
                         check (subscription_status in ('trialing','active','past_due','canceled','incomplete')),
  subscription_tier      text not null default 'pro',
  stripe_customer_id     text unique,
  stripe_subscription_id text unique,
  trial_ends_at          timestamptz not null default (now() + interval '7 days'),
  current_period_end     timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- ── 2. DEALS ─────────────────────────────────────────────────────────────────
create table if not exists public.deals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  brand       text not null,
  niche       text not null default '',
  status      text not null default 'Active'
              check (status in ('Active','Negotiating','Completed','Declined')),
  total_value numeric(10,2) not null default 0,
  paid        numeric(10,2) not null default 0,
  due_date    date,
  notes       text not null default '',
  contact     text not null default '',
  tags        text[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── 3. PLATFORM DELIVERABLES ─────────────────────────────────────────────────
-- Child rows of deals; each row = one platform × content-type × qty block.
create table if not exists public.platform_deliverables (
  id         uuid primary key default gen_random_uuid(),
  deal_id    uuid not null references public.deals(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  platform   text not null,
  type       text not null,
  qty        integer not null default 1 check (qty > 0),
  rate       numeric(10,2) not null default 0,
  done       boolean[] not null default '{}',
  sort_order integer not null default 0
);

-- ── 4. INQUIRIES (email inbox) ───────────────────────────────────────────────
create table if not exists public.inquiries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  brand       text not null,
  from_email  text not null default '',
  subject     text not null default '',
  body        text not null default '',
  offer       numeric(10,2) not null default 0,
  platform    text not null default 'Instagram',
  type        text not null default 'Reel',
  status      text not null default 'Unread'
              check (status in ('Unread','Reviewed','Accepted','Declined')),
  fit_score   integer check (fit_score between 1 and 10),
  ai_analysis text,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────────────────────
create index if not exists deals_user_id_idx                   on public.deals(user_id);
create index if not exists deals_status_idx                    on public.deals(user_id, status);
create index if not exists platform_deliverables_deal_id_idx   on public.platform_deliverables(deal_id);
create index if not exists platform_deliverables_user_id_idx   on public.platform_deliverables(user_id);
create index if not exists inquiries_user_id_idx               on public.inquiries(user_id);
create index if not exists inquiries_status_idx                on public.inquiries(user_id, status);

-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger deals_updated_at
  before update on public.deals
  for each row execute function public.handle_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- AUTO-CREATE PROFILE ON SIGNUP
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.profiles              enable row level security;
alter table public.deals                 enable row level security;
alter table public.platform_deliverables enable row level security;
alter table public.inquiries             enable row level security;

-- profiles: users see/edit only their own row
create policy "profiles: own row only"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- deals: users see/edit only their own deals
create policy "deals: own rows only"
  on public.deals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- platform_deliverables: scoped by user_id (redundant with deal cascade, but explicit)
create policy "deliverables: own rows only"
  on public.platform_deliverables for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- inquiries: users see/edit only their own
create policy "inquiries: own rows only"
  on public.inquiries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SERVICE ROLE BYPASS (for Stripe webhook writes to profiles)
-- The service role already bypasses RLS, so no extra policy needed.
-- But we grant explicit table access for clarity:
-- ─────────────────────────────────────────────────────────────────────────────
grant usage on schema public to service_role;
grant all on public.profiles              to service_role;
grant all on public.deals                 to service_role;
grant all on public.platform_deliverables to service_role;
grant all on public.inquiries             to service_role;

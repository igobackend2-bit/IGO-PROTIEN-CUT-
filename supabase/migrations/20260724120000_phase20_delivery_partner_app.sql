-- ============================================================================
-- Phase 20 (Delivery Partner App) migration
--
-- Phase 17 shipped delivery tracking with a documented gap: "No delivery-
-- partner role exists yet" (see update-location's comment) — any
-- authenticated user could call update-location, and delivery_partners had
-- no link back to a real auth identity at all. This migration closes that
-- gap so the new Delivery Partner App can authenticate as, and be
-- authorized as, a specific partner — server-side, via RLS + Edge
-- Functions, never trusted from the client.
--
-- Everything here follows the Phase 17 pattern: end users (partners) get
-- SELECT-only RLS on their own rows; every write goes through the
-- partner-app Edge Function (service role). No business rules move into
-- Flutter.
-- ============================================================================

-- ─── delivery_partners: link to a real auth identity ───────────────────────
alter table public.delivery_partners
  add column if not exists auth_user_id uuid unique references auth.users (id) on delete set null,
  add column if not exists email text,
  add column if not exists is_verified boolean not null default false,
  add column if not exists availability_status text not null default 'Offline'
    check (availability_status in ('Online', 'Offline', 'Break')),
  add column if not exists preferred_language text not null default 'en';

create index if not exists delivery_partners_auth_user_idx on public.delivery_partners (auth_user_id);

-- The existing "publicly readable" policy (phase7_8) already exposes name/
-- phone/vehicle to any authenticated caller — that's how the customer app's
-- order tracking screens show "your delivery partner". Kept as-is rather
-- than narrowed, since narrowing it would break that existing, unrelated
-- read path; the new columns added above carry no more sensitivity than
-- what's already public here (phone number).

-- ─── delivery_partner_documents ─────────────────────────────────────────────
-- KYC-style documents (license, vehicle RC, ID proof). Kept in their own
-- table (not columns on delivery_partners) so they can carry a per-document
-- verification status without a churn of boolean columns, and so they're
-- never swept up by the public delivery_partners read.
create table if not exists public.delivery_partner_documents (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.delivery_partners (id) on delete cascade,
  doc_type text not null check (doc_type in ('license', 'vehicle_rc', 'id_proof', 'insurance', 'other')),
  file_url text not null,
  status text not null default 'Pending' check (status in ('Pending', 'Verified', 'Rejected')),
  uploaded_at timestamptz not null default now()
);

create index if not exists delivery_partner_documents_partner_idx on public.delivery_partner_documents (partner_id);

alter table public.delivery_partner_documents enable row level security;

drop policy if exists "Partners can view their own documents" on public.delivery_partner_documents;
create policy "Partners can view their own documents"
  on public.delivery_partner_documents for select
  using (exists (
    select 1 from public.delivery_partners p
    where p.id = delivery_partner_documents.partner_id and p.auth_user_id = auth.uid()
  ));

-- ─── delivery_partner_shifts ────────────────────────────────────────────────
create table if not exists public.delivery_partner_shifts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.delivery_partners (id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists delivery_partner_shifts_partner_idx on public.delivery_partner_shifts (partner_id, started_at desc);
-- Enforces "one open shift per partner" at the database level, so a client
-- retry or double-tap on Start Shift can never fabricate two concurrent
-- shifts for the same partner.
create unique index if not exists delivery_partner_shifts_one_open_idx
  on public.delivery_partner_shifts (partner_id) where (ended_at is null);

alter table public.delivery_partner_shifts enable row level security;

drop policy if exists "Partners can view their own shifts" on public.delivery_partner_shifts;
create policy "Partners can view their own shifts"
  on public.delivery_partner_shifts for select
  using (exists (
    select 1 from public.delivery_partners p
    where p.id = delivery_partner_shifts.partner_id and p.auth_user_id = auth.uid()
  ));

-- ─── delivery_partner_earnings ──────────────────────────────────────────────
-- One row per completed delivery. amount is a flat per-delivery fee (see
-- DELIVERY_PARTNER_FEE in _shared/delivery.ts) — there is no existing
-- commission/payout config anywhere in this project, so a flat fee is the
-- simplest real rule rather than inventing a tiered/percentage scheme with
-- no source of truth to derive it from.
create table if not exists public.delivery_partner_earnings (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.delivery_partners (id) on delete cascade,
  assignment_id uuid not null unique references public.delivery_assignments (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  amount numeric not null,
  earned_at timestamptz not null default now()
);

create index if not exists delivery_partner_earnings_partner_idx on public.delivery_partner_earnings (partner_id, earned_at desc);

alter table public.delivery_partner_earnings enable row level security;

drop policy if exists "Partners can view their own earnings" on public.delivery_partner_earnings;
create policy "Partners can view their own earnings"
  on public.delivery_partner_earnings for select
  using (exists (
    select 1 from public.delivery_partners p
    where p.id = delivery_partner_earnings.partner_id and p.auth_user_id = auth.uid()
  ));

-- ─── delivery_partner_settlements ───────────────────────────────────────────
-- Payout batches. Created/marked-paid by admin (admin-delivery), read-only
-- for the partner — mirrors how orders.status is admin/system-driven and
-- customers only ever read it.
create table if not exists public.delivery_partner_settlements (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.delivery_partners (id) on delete cascade,
  period_start date not null,
  period_end date not null,
  total_amount numeric not null,
  status text not null default 'Pending' check (status in ('Pending', 'Paid')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists delivery_partner_settlements_partner_idx on public.delivery_partner_settlements (partner_id, period_start desc);

alter table public.delivery_partner_settlements enable row level security;

drop policy if exists "Partners can view their own settlements" on public.delivery_partner_settlements;
create policy "Partners can view their own settlements"
  on public.delivery_partner_settlements for select
  using (exists (
    select 1 from public.delivery_partners p
    where p.id = delivery_partner_settlements.partner_id and p.auth_user_id = auth.uid()
  ));

-- ─── delivery_partner_exclusions ────────────────────────────────────────────
-- Tracks which partners have already rejected/timed-out on a given order,
-- so reassignment (partner-app) never re-offers it to the same partner.
-- Internal bookkeeping only — no client ever reads this table directly, so
-- RLS is enabled with zero policies (default deny; service role bypasses).
create table if not exists public.delivery_partner_exclusions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  partner_id uuid not null references public.delivery_partners (id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now(),
  unique (order_id, partner_id)
);

alter table public.delivery_partner_exclusions enable row level security;

-- ─── delivery_assignments: acceptance window ────────────────────────────────
alter table public.delivery_assignments
  add column if not exists accept_deadline timestamptz;

-- ─── notifications: new type for settlement updates ────────────────────────
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in (
  'order_update', 'delivery_update', 'wishlist_stock_alert', 'offer',
  'coupon', 'flash_sale', 'referral_reward', 'general_announcement', 'settlement_update'
));

-- ─── Realtime ───────────────────────────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'delivery_partners'
  ) then
    alter publication supabase_realtime add table public.delivery_partners;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'delivery_partner_earnings'
  ) then
    alter publication supabase_realtime add table public.delivery_partner_earnings;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'delivery_partner_shifts'
  ) then
    alter publication supabase_realtime add table public.delivery_partner_shifts;
  end if;
end $$;

-- ─── Storage: private bucket for partner KYC documents ─────────────────────
-- Unlike 'avatars'/'review-photos'/'support-attachments' (all public read),
-- license/RC/ID documents are sensitive, so this bucket is private — reads
-- go through createSignedUrl, never getPublicUrl. Path convention matches
-- the existing 'avatars' bucket: `<auth_user_id>/...`.
insert into storage.buckets (id, name, public)
values ('delivery-partner-documents', 'delivery-partner-documents', false)
on conflict (id) do nothing;

drop policy if exists "Partners can upload their own documents" on storage.objects;
create policy "Partners can upload their own documents"
  on storage.objects for insert
  with check (bucket_id = 'delivery-partner-documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Partners can view their own documents in storage" on storage.objects;
create policy "Partners can view their own documents in storage"
  on storage.objects for select
  using (bucket_id = 'delivery-partner-documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Partners can update their own documents in storage" on storage.objects;
create policy "Partners can update their own documents in storage"
  on storage.objects for update
  using (bucket_id = 'delivery-partner-documents' and (storage.foldername(name))[1] = auth.uid()::text);

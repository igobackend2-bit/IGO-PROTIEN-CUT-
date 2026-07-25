-- ============================================================================
-- Phase 17 (Delivery Tracking) migration
--
-- `delivery_partners` already exists (Phase 7/8) — extended here, not
-- recreated, per the Phase 12 lesson about assuming schema state. Three new
-- tables (`delivery_assignments`, `delivery_locations`, `delivery_otps`)
-- carry all the new business state. ALL writes to these tables are meant to
-- go through the Phase 17 Edge Functions (service-role client) — RLS below
-- intentionally grants users SELECT only, never INSERT/UPDATE, so "no
-- business rules inside Flutter" is enforced at the database, not just by
-- convention.
--
-- No fake delivery activity is seeded or simulated here. `delivery_locations`
-- stays empty until a real GPS source (the future Delivery Partner App, or
-- a manual test call documented in the Edge Function README) posts to
-- `update-location`.
-- ============================================================================

-- ─── delivery_partners: extend ─────────────────────────────────────────────
alter table public.delivery_partners
  add column if not exists photo_url text,
  add column if not exists vehicle_type text,
  add column if not exists is_active boolean not null default true;

-- ─── delivery_assignments ───────────────────────────────────────────────────
create table if not exists public.delivery_assignments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  partner_id uuid not null references public.delivery_partners (id),
  status text not null default 'Partner Assigned' check (status in (
    'Accepted', 'Partner Assigned', 'Picked Up', 'On The Way',
    'Near You', 'Delivered', 'Cancelled', 'Failed'
  )),
  eta_minutes int,
  distance_meters numeric,
  assigned_at timestamptz not null default now(),
  picked_up_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists delivery_assignments_order_idx on public.delivery_assignments (order_id);
create index if not exists delivery_assignments_partner_idx on public.delivery_assignments (partner_id);

alter table public.delivery_assignments enable row level security;

drop policy if exists "Users can view assignments for their own orders" on public.delivery_assignments;
create policy "Users can view assignments for their own orders"
  on public.delivery_assignments for select
  using (exists (select 1 from public.orders o where o.id = delivery_assignments.order_id and o.user_id = auth.uid()));

create or replace function public.set_delivery_assignment_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_delivery_assignment_updated_at on public.delivery_assignments;
create trigger trg_delivery_assignment_updated_at
  before update on public.delivery_assignments
  for each row execute function public.set_delivery_assignment_updated_at();

-- ─── delivery_locations ─────────────────────────────────────────────────────
-- Time series of partner GPS pings. "Current location" = latest row per
-- assignment — no separate denormalized lat/lng column anywhere else, so
-- there is exactly one source of truth for where a partner currently is.
create table if not exists public.delivery_locations (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.delivery_assignments (id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  recorded_at timestamptz not null default now()
);

create index if not exists delivery_locations_assignment_recorded_idx on public.delivery_locations (assignment_id, recorded_at desc);

alter table public.delivery_locations enable row level security;

drop policy if exists "Users can view locations for their own orders" on public.delivery_locations;
create policy "Users can view locations for their own orders"
  on public.delivery_locations for select
  using (exists (
    select 1 from public.delivery_assignments a
    join public.orders o on o.id = a.order_id
    where a.id = delivery_locations.assignment_id and o.user_id = auth.uid()
  ));

-- ─── delivery_otps ───────────────────────────────────────────────────────────
create table if not exists public.delivery_otps (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete cascade,
  assignment_id uuid not null references public.delivery_assignments (id) on delete cascade,
  otp_code text not null,
  is_verified boolean not null default false,
  verified_at timestamptz,
  attempts int not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.delivery_otps enable row level security;

-- The customer legitimately needs to read their own plaintext code — this
-- mirrors the pre-existing DeliveryOtpCard design ("share this OTP with
-- your delivery partner"). Verification itself can still only be performed
-- through verify-delivery-otp (service role), so this SELECT grant doesn't
-- weaken the actual security boundary.
drop policy if exists "Users can view their own delivery OTP" on public.delivery_otps;
create policy "Users can view their own delivery OTP"
  on public.delivery_otps for select
  using (exists (select 1 from public.orders o where o.id = delivery_otps.order_id and o.user_id = auth.uid()));

-- ─── Realtime ───────────────────────────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'delivery_assignments'
  ) then
    alter publication supabase_realtime add table public.delivery_assignments;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'delivery_locations'
  ) then
    alter publication supabase_realtime add table public.delivery_locations;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'delivery_otps'
  ) then
    alter publication supabase_realtime add table public.delivery_otps;
  end if;
end $$;

-- ─── Trigger: order cancelled → cancel its delivery assignment too ─────────
-- Reuses the existing OrderService.cancelOrder() write path (Orders module
-- untouched) — this only keeps the delivery-side status in sync with it.
create or replace function public.sync_assignment_on_order_cancel()
returns trigger as $$
begin
  if new.status = 'Cancelled' and old.status is distinct from 'Cancelled' then
    update public.delivery_assignments
      set status = 'Cancelled', cancelled_at = now()
      where order_id = new.id and status not in ('Delivered', 'Cancelled', 'Failed');
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_sync_assignment_on_order_cancel on public.orders;
create trigger trg_sync_assignment_on_order_cancel
  after update on public.orders
  for each row execute function public.sync_assignment_on_order_cancel();

-- ─── Seed: at least one real, active delivery partner ──────────────────────
-- Without this, assign-delivery has no partner to assign — a functioning
-- roster is real business configuration (same category as the Phase 13
-- achievements catalog / Phase 15 offer seeds), not fabricated activity.
insert into public.delivery_partners (name, phone, vehicle_number, vehicle_type, rating, is_active)
select 'Arun Kumar', '+919000000001', 'TN 07 AB 1234', 'Bike', 4.8, true
where not exists (select 1 from public.delivery_partners);

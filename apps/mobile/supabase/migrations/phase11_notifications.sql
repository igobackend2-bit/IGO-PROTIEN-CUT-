-- ============================================================================
-- Phase 11 (Notifications) migration
-- Run once against the Protein Cuts Supabase project.
--
-- Notifications are generated server-side via triggers (not client Dart
-- code) so Order/Wishlist logic never has to change to "fire" a
-- notification — this is the only way to satisfy "no modification to
-- Order/Wishlist logic" while still reacting to real events (order status
-- changes, products restocking). Coupon/Offer/FlashSale/Referral/General
-- notifications have no real generating event yet (no admin panel, no real
-- referral-rewards backend), so nothing fabricates content for those types
-- here — the app is fully able to display and deep-link them the moment a
-- real source (e.g. an admin tool or edge function) starts inserting rows.
-- ============================================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in (
    'order_update', 'delivery_update', 'wishlist_stock_alert', 'offer',
    'coupon', 'flash_sale', 'referral_reward', 'general_announcement'
  )),
  title text not null,
  message text not null,
  data jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

-- No INSERT policy for regular users — rows are only ever created by the
-- SECURITY DEFINER trigger functions below, which run as the table owner
-- and therefore bypass RLS. Users can only read/update/delete their own.
drop policy if exists "Users can view their own notifications" on public.notifications;
create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update their own notifications" on public.notifications;
create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own notifications" on public.notifications;
create policy "Users can delete their own notifications"
  on public.notifications for delete
  using (auth.uid() = user_id);

-- ─── Realtime ───────────────────────────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;

-- ─── Trigger: order placed / order status changed ──────────────────────────
create or replace function public.notify_on_order_change()
returns trigger as $$
declare
  v_type text;
  v_title text;
  v_message text;
  v_wants_notification boolean;
begin
  v_wants_notification := coalesce(
    (select notify_order_updates from public.profiles where id = new.user_id),
    true
  );
  if not v_wants_notification then
    return new;
  end if;

  if TG_OP = 'INSERT' then
    insert into public.notifications (user_id, type, title, message, data)
    values (new.user_id, 'order_update', 'Order Placed', 'Your order has been placed successfully.', jsonb_build_object('order_id', new.id));
    return new;
  end if;

  -- TG_OP = 'UPDATE'
  if new.status is distinct from old.status then
    v_type := case when new.status in ('Out For Delivery', 'Delivered') then 'delivery_update' else 'order_update' end;
    v_title := case new.status
      when 'Accepted' then 'Order Confirmed'
      when 'Packing' then 'Order is Being Packed'
      when 'Ready' then 'Order Ready'
      when 'Out For Delivery' then 'Out for Delivery'
      when 'Delivered' then 'Order Delivered'
      when 'Cancelled' then 'Order Cancelled'
      when 'Refunded' then 'Order Refunded'
      else 'Order Update'
    end;
    v_message := 'Your order is now ' || new.status || '.';

    insert into public.notifications (user_id, type, title, message, data)
    values (new.user_id, v_type, v_title, v_message, jsonb_build_object('order_id', new.id));
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_notify_order_insert on public.orders;
create trigger trg_notify_order_insert
  after insert on public.orders
  for each row execute function public.notify_on_order_change();

drop trigger if exists trg_notify_order_status on public.orders;
create trigger trg_notify_order_status
  after update on public.orders
  for each row execute function public.notify_on_order_change();

-- ─── Trigger: wishlisted product back in stock ─────────────────────────────
create or replace function public.notify_on_product_restock()
returns trigger as $$
declare
  v_alert record;
  v_wants_notification boolean;
begin
  if new.is_available = true and coalesce(old.is_available, false) = false then
    for v_alert in select user_id from public.stock_alerts where product_id = new.id loop
      v_wants_notification := coalesce(
        (select notify_stock_alerts from public.profiles where id = v_alert.user_id),
        true
      );
      if v_wants_notification then
        insert into public.notifications (user_id, type, title, message, data)
        values (
          v_alert.user_id,
          'wishlist_stock_alert',
          'Back in Stock!',
          new.name || ' is back in stock — grab it before it sells out again.',
          jsonb_build_object('product_id', new.id)
        );
      end if;
    end loop;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_notify_product_restock on public.products;
create trigger trg_notify_product_restock
  after update on public.products
  for each row execute function public.notify_on_product_restock();

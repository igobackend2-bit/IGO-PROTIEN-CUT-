-- ============================================================================
-- Phase 16 (Customer Support) migration
--
-- Three new tables: support_tickets, ticket_messages, faq_items. Tickets
-- reference orders.id (uuid, matching the established schema) but never
-- duplicate order/payment logic — refund data continues to live entirely
-- on `payments` (Phase 7/8) and is only *read* by the Support module.
--
-- Agent-side replies are expected to be inserted by real support staff
-- (via the Supabase dashboard or a future admin tool) — nothing here
-- fabricates agent activity. FAQ rows seeded below are real, functional
-- help content a business would write, the same category as the Phase 13
-- achievements catalog / Phase 15 offer seeds — not fabricated user data.
-- ============================================================================

-- ─── support_tickets ────────────────────────────────────────────────────────
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  category text not null check (category in (
    'missing_item', 'wrong_item', 'damaged_item', 'delivery_issue',
    'payment_issue', 'return', 'other'
  )),
  subject text not null,
  description text not null,
  status text not null default 'Open' check (status in ('Open', 'In Progress', 'Waiting', 'Resolved', 'Closed')),
  attachment_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_tickets_user_created_idx on public.support_tickets (user_id, created_at desc);

alter table public.support_tickets enable row level security;

drop policy if exists "Users can view their own tickets" on public.support_tickets;
create policy "Users can view their own tickets"
  on public.support_tickets for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own tickets" on public.support_tickets;
create policy "Users can create their own tickets"
  on public.support_tickets for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own tickets" on public.support_tickets;
create policy "Users can update their own tickets"
  on public.support_tickets for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_ticket_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_ticket_updated_at on public.support_tickets;
create trigger trg_ticket_updated_at
  before update on public.support_tickets
  for each row execute function public.set_ticket_updated_at();

-- ─── ticket_messages ────────────────────────────────────────────────────────
create table if not exists public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets (id) on delete cascade,
  sender text not null check (sender in ('customer', 'agent', 'system')),
  message text not null,
  attachment text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists ticket_messages_ticket_created_idx on public.ticket_messages (ticket_id, created_at);

alter table public.ticket_messages enable row level security;

drop policy if exists "Users can view messages on their own tickets" on public.ticket_messages;
create policy "Users can view messages on their own tickets"
  on public.ticket_messages for select
  using (exists (select 1 from public.support_tickets t where t.id = ticket_messages.ticket_id and t.user_id = auth.uid()));

drop policy if exists "Users can send customer messages on their own tickets" on public.ticket_messages;
create policy "Users can send customer messages on their own tickets"
  on public.ticket_messages for insert
  with check (
    sender = 'customer'
    and exists (select 1 from public.support_tickets t where t.id = ticket_messages.ticket_id and t.user_id = auth.uid())
  );

drop policy if exists "Users can mark their ticket messages read" on public.ticket_messages;
create policy "Users can mark their ticket messages read"
  on public.ticket_messages for update
  using (exists (select 1 from public.support_tickets t where t.id = ticket_messages.ticket_id and t.user_id = auth.uid()))
  with check (exists (select 1 from public.support_tickets t where t.id = ticket_messages.ticket_id and t.user_id = auth.uid()));

-- ─── faq_items ──────────────────────────────────────────────────────────────
create table if not exists public.faq_items (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  question text not null,
  answer text not null,
  priority int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.faq_items
  add column if not exists helpful_count int not null default 0,
  add column if not exists not_helpful_count int not null default 0;

create index if not exists faq_items_category_priority_idx on public.faq_items (category, priority desc);

alter table public.faq_items enable row level security;

drop policy if exists "FAQs are publicly readable" on public.faq_items;
create policy "FAQs are publicly readable"
  on public.faq_items for select
  using (true);

-- Atomic feedback increment — no per-user vote tracking table, just an
-- honest aggregate counter, updated via one RPC so concurrent votes can't
-- race a read-then-write from the client.
create or replace function public.increment_faq_feedback(p_faq_id uuid, p_helpful boolean)
returns void as $$
begin
  if p_helpful then
    update public.faq_items set helpful_count = helpful_count + 1 where id = p_faq_id;
  else
    update public.faq_items set not_helpful_count = not_helpful_count + 1 where id = p_faq_id;
  end if;
end;
$$ language plpgsql security definer;

-- ─── Realtime ───────────────────────────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'support_tickets'
  ) then
    alter publication supabase_realtime add table public.support_tickets;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'ticket_messages'
  ) then
    alter publication supabase_realtime add table public.ticket_messages;
  end if;
end $$;

-- ─── notifications: extend the existing type check, no new table ──────────
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in (
    'order_update', 'delivery_update', 'wishlist_stock_alert', 'offer',
    'coupon', 'flash_sale', 'referral_reward', 'general_announcement',
    'subscription', 'support'
  ));

-- ─── Trigger: agent reply → notify the customer ────────────────────────────
create or replace function public.notify_on_ticket_message()
returns trigger as $$
declare
  v_user_id uuid;
  v_subject text;
begin
  if new.sender <> 'agent' then
    return new;
  end if;
  select user_id, subject into v_user_id, v_subject from public.support_tickets where id = new.ticket_id;
  if v_user_id is null then
    return new;
  end if;
  insert into public.notifications (user_id, type, title, message, data)
  values (
    v_user_id, 'support', 'New reply: ' || coalesce(v_subject, 'Support ticket'),
    left(new.message, 140), jsonb_build_object('ticket_id', new.ticket_id)
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_notify_ticket_message on public.ticket_messages;
create trigger trg_notify_ticket_message
  after insert on public.ticket_messages
  for each row execute function public.notify_on_ticket_message();

-- ─── Trigger: staff-driven ticket status change → notify the customer ─────
-- Skipped when the customer changed their own ticket's status (e.g. tapping
-- "Close ticket") — auth.uid() = new.user_id in that case — so users are
-- never notified about their own action.
create or replace function public.notify_on_ticket_status_change()
returns trigger as $$
begin
  if new.status is distinct from old.status and auth.uid() is distinct from new.user_id then
    insert into public.notifications (user_id, type, title, message, data)
    values (
      new.user_id, 'support', 'Ticket update: ' || new.subject,
      'Your support ticket is now ' || new.status || '.', jsonb_build_object('ticket_id', new.id)
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_notify_ticket_status on public.support_tickets;
create trigger trg_notify_ticket_status
  after update on public.support_tickets
  for each row execute function public.notify_on_ticket_status_change();

-- ─── support-attachments storage (ticket images) ───────────────────────────
insert into storage.buckets (id, name, public)
values ('support-attachments', 'support-attachments', true)
on conflict (id) do nothing;

drop policy if exists "Support attachments are publicly readable" on storage.objects;
create policy "Support attachments are publicly readable"
  on storage.objects for select
  using (bucket_id = 'support-attachments');

drop policy if exists "Users can upload their own support attachments" on storage.objects;
create policy "Users can upload their own support attachments"
  on storage.objects for insert
  with check (bucket_id = 'support-attachments' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can update their own support attachments" on storage.objects;
create policy "Users can update their own support attachments"
  on storage.objects for update
  using (bucket_id = 'support-attachments' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can delete their own support attachments" on storage.objects;
create policy "Users can delete their own support attachments"
  on storage.objects for delete
  using (bucket_id = 'support-attachments' and (storage.foldername(name))[1] = auth.uid()::text);

-- ─── Seed: real FAQ content ─────────────────────────────────────────────────
insert into public.faq_items (category, question, answer, priority)
select * from (values
  ('Orders', 'How do I track my order?', 'Open Orders from your Profile tab and tap any order to see its live status and delivery timeline.', 100),
  ('Orders', 'Can I cancel my order?', 'Orders can be cancelled while they are still Pending, Accepted or Packing. Once an order is Out For Delivery it can no longer be cancelled from the app — please contact support.', 90),
  ('Orders', 'How do I change my delivery address after placing an order?', 'Delivery details can''t be edited once an order is placed. Please cancel (if still eligible) and place a new order, or contact support for help.', 70),
  ('Payments', 'What payment methods are supported?', 'We currently support Cash on Delivery. More payment methods are being added soon.', 100),
  ('Payments', 'My payment failed but money was deducted. What do I do?', 'Raise a Payment Issue ticket from Support with your order number — our team will verify and refund any wrongly deducted amount.', 90),
  ('Payments', 'How long do refunds take?', 'Refunds are typically processed within 5-7 business days of approval, back to your original payment method.', 80),
  ('Delivery', 'What are your delivery hours?', 'We deliver daily during the slots shown at checkout. Exact availability depends on your delivery address.', 90),
  ('Delivery', 'What if I miss my delivery?', 'Our delivery partner will attempt to contact you. If delivery can''t be completed, raise a Delivery Issue ticket and we''ll help reschedule.', 80),
  ('Returns', 'What is your return policy?', 'Delivered orders are eligible for a return if there''s a quality, damage or wrong-item issue. Start a return from the order''s Support option.', 100),
  ('Returns', 'How do I request a return?', 'Go to the order in question, tap Report an Issue, choose the reason, and submit — we''ll arrange a pickup and keep you updated on its status.', 90),
  ('Account', 'How do I update my profile details?', 'Go to Profile > Edit Profile to update your name, phone number and photo.', 60),
  ('Account', 'How do referral rewards work?', 'Share your referral code from Profile > Referral. You earn points and cash when a friend places their first order, and they get a discount too.', 50)
) as seed(category, question, answer, priority)
where not exists (select 1 from public.faq_items);

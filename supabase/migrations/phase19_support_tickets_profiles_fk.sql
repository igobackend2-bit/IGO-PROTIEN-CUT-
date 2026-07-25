-- ============================================================================
-- Phase 19 (Admin Dashboard) — support_tickets → profiles relationship
--
-- admin-support's `listTickets`/`getTicket` embed `profiles ( full_name )`
-- off `support_tickets.user_id`, but that column only has a foreign key to
-- `auth.users(id)` (phase16_support.sql) — PostgREST can't auto-embed
-- across schemas, so every listTickets/getTicket call 500s with
-- "Could not find a relationship between 'support_tickets' and 'profiles'
-- in the schema cache". `public.profiles.id` is always equal to the
-- matching `auth.users.id` (standard 1:1 profile convention already used
-- everywhere else in this project), so adding a second FK straight to
-- profiles is safe and gives PostgREST the direct path it needs.
-- ============================================================================

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'support_tickets_user_id_profiles_fkey'
  ) then
    alter table public.support_tickets
      add constraint support_tickets_user_id_profiles_fkey
      foreign key (user_id) references public.profiles (id) on delete cascade;
  end if;
end $$;

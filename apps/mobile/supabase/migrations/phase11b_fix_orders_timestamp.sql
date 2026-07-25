-- ============================================================================
-- Fix: orders.created_at was created as a naive `timestamp without time
-- zone` column. Supabase's Postgres stores wall-clock UTC in that column,
-- but PostgREST then serializes it without a 'Z'/offset — so Dart's
-- DateTime.parse() misreads it as already being local time, leaving the
-- date correct but the time off by the device's UTC offset (e.g. ~5:30 for
-- India). Converting to `timestamptz` makes PostgREST include the offset,
-- so `.toLocal()` in the app (already called everywhere `created_at` is
-- parsed) converts correctly.
-- ============================================================================

alter table public.orders
  alter column created_at type timestamptz
  using created_at at time zone 'UTC';

alter table public.orders
  alter column created_at set default now();

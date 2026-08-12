-- Adds email + password authentication support to igo_customers.
-- Run once in the Supabase SQL editor after 0002_igo_platform_schema.sql:
-- https://supabase.com/dashboard/project/aweevhgnbjuxcvnvjeie/sql/new
--
-- password_hash stores "salt:hash" (Node crypto.scrypt, hex-encoded) — never
-- a plaintext password, and never sent back to the browser once stored.

alter table public.igo_customers
  add column if not exists password_hash text;

-- Case-insensitive uniqueness so "User@x.com" and "user@x.com" can't both
-- register separate accounts.
create unique index if not exists idx_igo_customers_email_unique
  on public.igo_customers (lower(email))
  where email is not null;

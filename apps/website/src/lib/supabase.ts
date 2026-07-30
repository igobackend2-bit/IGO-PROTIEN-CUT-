import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * The real Supabase browser client — anon key only.
 *
 * This is the same project (`aweevhgnbjuxcvnvjeie`) the Flutter customer app
 * and the Flutter admin dashboard use, and this client is configured exactly
 * the way the app's own `Supabase.initialize(url, anonKey)` is. Every read
 * and write below therefore goes through the identical RLS policies the app
 * already relies on — the website is simply a third client of a backend that
 * already exists.
 *
 * SECURITY: the service-role key must never appear here or anywhere else in
 * `src/`. It bypasses RLS entirely and would end up in the Vite bundle, i.e.
 * public. Server-only code (`server.ts`) is the only place it may be read,
 * from `process.env`.
 *
 * NOTE: `src/lib/supabaseClient.ts` is a *different*, legacy file — despite
 * its name it contains no Supabase calls at all, only localStorage shims.
 * New code should import from THIS file. The legacy one is being retired
 * module by module.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * True when real credentials are present. Every call site checks this and
 * falls back to local/mock data when false, so the site still runs for a
 * developer who hasn't set up `.env` yet — the same "degrade gracefully"
 * approach the Flutter app takes with its optional columns.
 */
export const isSupabaseConfigured =
  typeof supabaseUrl === 'string' &&
  supabaseUrl.length > 0 &&
  supabaseUrl.startsWith('http') &&
  typeof supabaseAnonKey === 'string' &&
  supabaseAnonKey.length > 0;

if (!isSupabaseConfigured && import.meta.env.DEV) {
  // Deliberately a warning, not a throw: the site is designed to keep working
  // on mock data without a backend.
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set. ' +
      'Falling back to local mock data. Catalog, auth and orders will not be live.'
  );
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        // Persist the session so a signed-in customer stays signed in across
        // reloads, and refresh it in the background before it expires.
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'protein_cuts_supabase_auth'
      }
    })
  : null;

/**
 * Narrowing helper. Call sites read better as:
 *   const db = requireSupabase(); if (!db) return fallback;
 */
export function requireSupabase(): SupabaseClient | null {
  return supabase;
}

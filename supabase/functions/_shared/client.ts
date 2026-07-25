import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Service-role client — bypasses RLS. Every delivery Edge Function uses
 * this for its actual reads/writes, since `delivery_assignments` /
 * `delivery_locations` / `delivery_otps` intentionally grant end users
 * SELECT only (see phase17_delivery.sql). This is what "no business rules
 * inside Flutter" cashes out to at the database level.
 */
export function serviceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

/**
 * Resolves the authenticated caller from the request's Authorization
 * header, using the anon key + the caller's own JWT (never the service
 * role) so this only ever succeeds for a real, currently-valid session —
 * exactly what a future Admin Dashboard / Delivery Partner App call would
 * present too, just with a different user's token.
 */
export async function requireUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  const client = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

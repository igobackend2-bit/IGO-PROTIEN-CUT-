import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../supabase';
import { submitLead } from './catalog';

/**
 * REAL AUTHENTICATION — Supabase Auth, identical to the Flutter customer app
 * (lib/services/auth_service.dart) and the Flutter admin dashboard
 * (features/auth/data/auth_repository_impl.dart).
 *
 * This replaces the previous client-side fake in `supabaseClient.ts`, which
 * minted a session with NO password check and granted 'Super Admin' to any
 * email containing the string "admin".
 *
 * Because this is a genuine Supabase session, every RLS policy the app
 * already relies on (`auth.uid() = user_id` on orders, profiles, tickets,
 * subscriptions, wishlist…) applies to the website automatically. That is
 * what lets the website write to the canonical tables without a single
 * backend change.
 */

export interface AuthResult {
  ok: boolean;
  error?: string;
  user?: User;
}

export interface CustomerProfile {
  id: string;
  fullName: string | null;
  phoneNumber: string | null;
  profileImageUrl: string | null;
  walletBalance: number;
  referralCode: string | null;
  notifyOrderUpdates: boolean;
  notifyPromotions: boolean;
  notifyOffers: boolean;
  notifyStockAlerts: boolean;
}

/**
 * Membership tiers. These MIRROR the app's lib/models/membership_tier.dart —
 * Bronze/Silver/Gold/Platinum earned by reward points at 0/500/1500/3000.
 *
 * The website previously had its own Gold/Platinum/Elite ladder with manual
 * upgrade. Both read the same `profiles` row, so only one can be true; the
 * app's is canonical and the website now follows it. This is presentation
 * only — no column is written by the website.
 */
export const MEMBERSHIP_TIERS = [
  { key: 'bronze', label: 'Bronze', requiredPoints: 0 },
  { key: 'silver', label: 'Silver', requiredPoints: 500 },
  { key: 'gold', label: 'Gold', requiredPoints: 1500 },
  { key: 'platinum', label: 'Platinum', requiredPoints: 3000 }
] as const;

export type MembershipTierKey = (typeof MEMBERSHIP_TIERS)[number]['key'];
export type MembershipTier = (typeof MEMBERSHIP_TIERS)[number];

export function tierForPoints(points: number): MembershipTier {
  let current: MembershipTier = MEMBERSHIP_TIERS[0];
  for (const tier of MEMBERSHIP_TIERS) {
    if (points >= tier.requiredPoints) current = tier;
  }
  return current;
}

const AUTH_EVENT = 'protein_cuts_auth_updated';

function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_EVENT));
}

// ── Session ─────────────────────────────────────────────────────────────────

export async function getSession(): Promise<Session | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

/**
 * Subscribes to sign-in / sign-out / token-refresh. Returns an unsubscribe
 * function suitable for a React useEffect cleanup.
 */
export function onAuthStateChange(callback: (session: Session | null) => void): () => void {
  if (!isSupabaseConfigured || !supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
    notifyAuthChanged();
  });
  return () => data.subscription.unsubscribe();
}

/**
 * Fires when the customer arrives via a Supabase password-reset email link.
 * `detectSessionInUrl: true` (src/lib/supabase.ts) makes the client silently
 * sign the customer in from the link's recovery tokens — with nothing
 * listening for this event, that sign-in was the ONLY thing that happened;
 * the customer landed on /account fully logged in and never got a chance to
 * actually set a new password. This lets the caller pop the auth modal
 * straight into its "set a new password" view when that happens.
 */
export function onPasswordRecovery(callback: () => void): () => void {
  if (!isSupabaseConfigured || !supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') callback();
  });
  return () => data.subscription.unsubscribe();
}

// ── Sign up / in / out ──────────────────────────────────────────────────────

/**
 * Resolves a referral code to the referrer's user id via the app's own
 * `resolve_referral_code` RPC (lib/services/loyalty_service.dart calls the
 * same function). Best-effort: an invalid/unknown code, or the RPC not
 * existing, just means no referrer gets linked — it never blocks signup.
 */
async function resolveReferralCode(code: string): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.rpc('resolve_referral_code', { code: code.trim() });
    if (error) return null;
    return typeof data === 'string' ? data : null;
  } catch {
    return null;
  }
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  phone?: string,
  referralCode?: string
): Promise<AuthResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Backend not configured.' };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Written into auth.users.raw_user_meta_data. The app's profile trigger
      // (or the profile upsert below) picks these up.
      data: { full_name: fullName, phone_number: phone ?? null }
    }
  });

  if (error) {
    // Supabase's own wording varies by version ("User already registered",
    // "A user with this email address has already been registered"), so
    // match loosely rather than on one exact string.
    if (/already regist|already exists/i.test(error.message)) {
      return { ok: false, error: 'An account with this email already exists. Please sign in instead.' };
    }
    return { ok: false, error: error.message };
  }
  if (!data.user) return { ok: false, error: 'Sign up failed. Please try again.' };

  // With "leaked email protection" / anti-enumeration behavior enabled,
  // Supabase doesn't return an error for a duplicate email at all — it
  // returns a 200 with a user object whose `identities` array is empty
  // instead of creating anything. Silently treating that as success would
  // tell the customer they just made an account they already have.
  if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return { ok: false, error: 'An account with this email already exists. Please sign in instead.' };
  }

  // Same pattern as the app's signUp(): resolve the code to a referrer id
  // BEFORE creating the profile row, so `referred_by` is set atomically with
  // the rest of the profile rather than in a separate follow-up write.
  const referredBy = referralCode && referralCode.trim() ? await resolveReferralCode(referralCode) : null;

  // Ensure a profiles row exists with the details we collected. Uses upsert
  // so it's harmless if the app's own signup trigger already created one.
  await upsertProfile(data.user.id, {
    fullName,
    phoneNumber: phone ?? null,
    ...(referredBy ? { referredBy } : {})
  });

  // Surface every new website sign-up in /admin's Leads tab too, using the
  // same `igo_leads` table and `submitLead` helper the B2B/franchise/contact
  // forms already write through — no schema change, no new table, no other
  // code touched. `lead_type: 'signup'` distinguishes these from franchise/
  // b2b/corporate enquiries in the Leads list and CSV export. Best-effort:
  // a failure here never blocks account creation.
  void submitLead({
    leadType: 'signup',
    fullName,
    email,
    phone: phone ?? '',
    message: 'New customer account created on the website.'
  });

  notifyAuthChanged();
  return { ok: true, user: data.user };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Backend not configured.' };
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  notifyAuthChanged();
  return { ok: true, user: data.user };
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  await supabase.auth.signOut();
  notifyAuthChanged();
}

export async function resetPassword(email: string): Promise<AuthResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Backend not configured.' };
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/account`
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ── Profile ─────────────────────────────────────────────────────────────────

/**
 * Reads the canonical `profiles` row — the SAME row the mobile app and the
 * admin's Customers screen read. A customer who signs up in the app sees
 * their real name, phone, wallet balance and referral code on the website.
 */
export async function fetchProfile(userId: string): Promise<CustomerProfile | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, full_name, phone_number, profile_image_url, wallet_balance, referral_code, ' +
        'notify_order_updates, notify_promotions, notify_offers, notify_stock_alerts'
    )
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return null;

  // The client is untyped (no generated database types), so PostgREST results
  // come back as a union that includes an error shape. Casting through
  // `unknown` is the documented way to narrow it.
  const row = data as unknown as Record<string, unknown>;

  return {
    id: String(row.id),
    fullName: (row.full_name as string) ?? null,
    phoneNumber: (row.phone_number as string) ?? null,
    profileImageUrl: (row.profile_image_url as string) ?? null,
    walletBalance: Number(row.wallet_balance ?? 0),
    referralCode: (row.referral_code as string) ?? null,
    notifyOrderUpdates: row.notify_order_updates !== false,
    notifyPromotions: row.notify_promotions !== false,
    notifyOffers: row.notify_offers !== false,
    notifyStockAlerts: row.notify_stock_alerts !== false
  };
}

/**
 * Updates only the columns a customer owns. Guarded by the existing
 * `auth.uid() = id` RLS policy, so a user can never write someone else's row.
 * Deliberately does NOT touch wallet_balance or reward points — those are
 * written by the app's database triggers and the admin, never by a client.
 */
export async function upsertProfile(
  userId: string,
  patch: Partial<{
    fullName: string | null;
    phoneNumber: string | null;
    profileImageUrl: string | null;
    notifyOrderUpdates: boolean;
    notifyPromotions: boolean;
    notifyOffers: boolean;
    notifyStockAlerts: boolean;
    referredBy: string | null;
  }>
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Backend not configured.' };
  }

  const row: Record<string, unknown> = { id: userId };
  if (patch.fullName !== undefined) row.full_name = patch.fullName;
  if (patch.phoneNumber !== undefined) row.phone_number = patch.phoneNumber;
  if (patch.profileImageUrl !== undefined) row.profile_image_url = patch.profileImageUrl;
  if (patch.notifyOrderUpdates !== undefined) row.notify_order_updates = patch.notifyOrderUpdates;
  if (patch.notifyPromotions !== undefined) row.notify_promotions = patch.notifyPromotions;
  if (patch.notifyOffers !== undefined) row.notify_offers = patch.notifyOffers;
  if (patch.notifyStockAlerts !== undefined) row.notify_stock_alerts = patch.notifyStockAlerts;
  if (patch.referredBy !== undefined) row.referred_by = patch.referredBy;

  const { error } = await supabase.from('profiles').upsert(row, { onConflict: 'id' });
  if (error) {
    // `referred_by` is only set once, at signup — if it's the cause of the
    // failure (e.g. an FK/type mismatch on an unexpected value), retry
    // without it rather than losing the rest of the profile write.
    if ('referred_by' in row) {
      const { referred_by, ...withoutReferral } = row;
      const retry = await supabase.from('profiles').upsert(withoutReferral, { onConflict: 'id' });
      if (!retry.error) {
        notifyAuthChanged();
        return { ok: true };
      }
    }
    return { ok: false, error: error.message };
  }
  notifyAuthChanged();
  return { ok: true };
}

// ── Loyalty (read-only) ─────────────────────────────────────────────────────

export interface LoyaltySnapshot {
  points: number;
  walletBalance: number;
  tier: (typeof MEMBERSHIP_TIERS)[number];
}

/**
 * Reward points are derived by summing `reward_transactions`, exactly as the
 * app does — there is no denormalised points column, and the website must not
 * invent one. Wallet balance comes from `profiles.wallet_balance`, which the
 * app's triggers maintain.
 */
export async function fetchLoyalty(userId: string): Promise<LoyaltySnapshot | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  const [pointsRes, profileRes] = await Promise.all([
    supabase.from('reward_transactions').select('points').eq('user_id', userId),
    supabase.from('profiles').select('wallet_balance').eq('id', userId).maybeSingle()
  ]);

  const points = (pointsRes.data ?? []).reduce(
    (sum: number, r: { points: number }) => sum + Number(r.points ?? 0),
    0
  );
  const walletBalance = Number(profileRes.data?.wallet_balance ?? 0);

  return { points, walletBalance, tier: tierForPoints(points) };
}

// ── Admin check (for the slimmed website /admin page) ───────────────────────

/**
 * Checks membership in the app's `admin_users` table. That table carries a
 * self-read policy (`auth.uid() = user_id`) created by phase18_admin.sql, so
 * this read works with the anon key for the caller's OWN row only — and it
 * modifies nothing.
 *
 * This replaces the previous `email.includes('admin')` check, which granted
 * Super Admin to anyone who typed the right address.
 */
export async function isActiveAdmin(): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const user = await getCurrentUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id, is_active')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) return false;
  return data.is_active === true;
}

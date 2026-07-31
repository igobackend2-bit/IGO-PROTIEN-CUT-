import { supabase, isSupabaseConfigured } from '../supabase';

/**
 * ACHIEVEMENTS — read-only. `achievements` is publicly readable per
 * CLAUDE.md (`for select using (true)`); `user_achievements` is joined the
 * same way the app's `LoyaltyService.fetchAchievements()` does
 * (lib/services/loyalty_service.dart) — one query, filtered client-side to
 * this user's own unlock row. Unlocking itself happens server-side via a
 * database trigger (per the app's own comment), so the website never writes
 * to either table.
 */
export interface AchievementRow {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
}

export async function fetchAchievements(): Promise<AchievementRow[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  const { data, error } = await supabase
    .from('achievements')
    .select('*, user_achievements(unlocked_at, user_id)')
    .order('title');

  if (error) {
    console.error('[achievements] fetch failed:', error.message);
    return null;
  }

  return (data ?? []).map((row: Record<string, any>) => {
    const unlocks = Array.isArray(row.user_achievements) ? row.user_achievements : [];
    const mine = unlocks.find((u: Record<string, any>) => u.user_id === userId);
    return {
      id: String(row.id),
      code: String(row.code ?? ''),
      title: String(row.title ?? ''),
      description: String(row.description ?? ''),
      icon: String(row.icon ?? 'star'),
      unlockedAt: mine?.unlocked_at ?? null
    };
  });
}

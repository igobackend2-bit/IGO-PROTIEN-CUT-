import { supabase, isSupabaseConfigured } from '../supabase';

/**
 * BATCH TRACEABILITY — real lookups backed by `igo_batch_trace`
 * (see supabase/migrations/0019_batch_traceability.sql).
 *
 * Replaces the old hardcoded "always Verified" result in
 * TraceabilitySection.tsx with an actual table lookup. Read is public
 * (anyone with a batch ID can trace it — that's the feature); writes are
 * gated to `admin_users` membership via RLS, same as every other
 * website-owned table.
 */

export interface Result<T = void> {
  ok: boolean;
  data?: T;
  error?: string;
}

function noBackend<T>(): Result<T> {
  return { ok: false, error: 'Backend not configured.' };
}

export interface BatchTraceRow {
  id: string;
  batch_id: string;
  product_name: string | null;
  farm_name: string;
  farm_location: string;
  cut_date: string;
  handler: string;
  temp_log: string;
  created_at: string;
}

/** Public lookup — case-insensitive, exact batch ID match. Null = not found, not an error. */
export async function lookupBatch(batchId: string): Promise<Result<BatchTraceRow | null>> {
  if (!isSupabaseConfigured || !supabase) return noBackend();
  const { data, error } = await supabase
    .from('igo_batch_trace')
    .select('*')
    .ilike('batch_id', batchId.trim())
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: (data as unknown as BatchTraceRow) ?? null };
}

/** Admin-only: full list, newest first. */
export async function listBatchTrace(): Promise<Result<BatchTraceRow[]>> {
  if (!isSupabaseConfigured || !supabase) return noBackend();
  const { data, error } = await supabase
    .from('igo_batch_trace')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: (data ?? []) as unknown as BatchTraceRow[] };
}

/** Admin-only: create a new batch record. RLS rejects this for non-admins. */
export async function createBatchTrace(row: {
  batch_id: string;
  product_name: string;
  farm_name: string;
  farm_location: string;
  cut_date: string;
  handler: string;
  temp_log: string;
}): Promise<Result> {
  if (!isSupabaseConfigured || !supabase) return noBackend();
  const { error } = await supabase.from('igo_batch_trace').insert(row);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Admin-only: remove a batch record. */
export async function deleteBatchTrace(id: string): Promise<Result> {
  if (!isSupabaseConfigured || !supabase) return noBackend();
  const { error } = await supabase.from('igo_batch_trace').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Persistent data will be disabled.');
}

// Use a dummy URL and key if env vars are missing to prevent fatal crash
const finalUrl = supabaseUrl || 'https://placeholder.supabase.co';
const finalKey = supabaseAnonKey || 'placeholder-key';

export const isSupabaseConfigured = !!supabaseUrl && !supabaseUrl.includes('placeholder') && !!supabaseAnonKey && !supabaseAnonKey.includes('placeholder');

export const supabase = createClient(finalUrl, finalKey);

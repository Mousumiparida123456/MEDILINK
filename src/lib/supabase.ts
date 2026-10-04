import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.demo').trim();

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  !rawUrl.includes('demo-medilink') &&
  !rawUrl.includes('placeholder') &&
  !rawUrl.includes('example.com') &&
  (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))
);

const supabaseUrl = isSupabaseConfigured
  ? rawUrl.replace(/\/+$/, '').replace(/\/(rest|auth)\/v\d+$/i, '')
  : 'https://demo-medilink.supabase.co';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

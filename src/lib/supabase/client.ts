'use client';

import { createBrowserClient } from '@supabase/ssr';
import { publicEnv, isSupabaseConfigured } from '@/lib/env';

/**
 * Browser Supabase client — uses the ANON key only.
 * Safe to ship to the client; all access is constrained by RLS.
 * Never import the service-role client here.
 */
export function createClient() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase public env not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.',
    );
  }
  return createBrowserClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey);
}

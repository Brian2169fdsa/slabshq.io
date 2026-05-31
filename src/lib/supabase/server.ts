import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { publicEnv } from '@/lib/env';

/**
 * Server-side Supabase client bound to the request's auth cookies.
 * Uses the ANON key + the user's session => RLS applies as that user.
 * This is the correct client for reading tenant-scoped data on behalf
 * of the logged-in user. For privileged cross-tenant/admin work use
 * the service-role admin client instead (admin.ts).
 */
export function createClient() {
  const cookieStore = cookies();
  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component (read-only cookies). Safe to ignore;
          // session refresh is handled by middleware.
        }
      },
    },
  });
}

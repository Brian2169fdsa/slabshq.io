/**
 * Centralized, typed environment access.
 *
 * SECURITY BOUNDARY:
 *  - Anything read here WITHOUT the `NEXT_PUBLIC_` prefix is server-only.
 *    Next.js statically guarantees non-prefixed vars are stripped from the
 *    client bundle. Do not import `serverEnv` from a Client Component.
 *  - `publicEnv` is the only env surface that may touch the browser.
 */

export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
};

/** True when the public Supabase config is present. */
export const isSupabaseConfigured =
  publicEnv.supabaseUrl.length > 0 && publicEnv.supabaseAnonKey.length > 0;

export function getServerEnv() {
  // Guard: never let this module's server fields be read in the browser.
  if (typeof window !== 'undefined') {
    throw new Error('serverEnv accessed in the browser — this is a security bug.');
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return {
    supabaseUrl,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    // Hardcoded demo tenant per FRONTEND_INTEGRATION.md §3 until auth lands.
    demoTenantId: process.env.DEMO_TENANT_ID ?? '00000000-0000-0000-0000-000000000001',
    // Defaults to the project's functions base when not overridden.
    functionsUrl:
      process.env.SUPABASE_FUNCTIONS_URL ?? (supabaseUrl ? `${supabaseUrl}/functions/v1` : ''),
  };
}

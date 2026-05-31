import 'server-only';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getServerEnv } from '@/lib/env';

/**
 * SERVICE-ROLE client — bypasses RLS. SERVER-ONLY.
 *
 * Hard guarantees that the key never reaches the client:
 *  1. `import 'server-only'` => a build error if any Client Component
 *     imports this module (directly or transitively).
 *  2. The key is read from SUPABASE_SERVICE_ROLE_KEY (no NEXT_PUBLIC_
 *     prefix), so Next.js never inlines it into the browser bundle.
 *  3. Runtime guard throws if `window` exists.
 *
 * USAGE RULE: because this bypasses RLS, every query MUST be manually
 * scoped with `.eq('tenant_id', tenantId)`. Never trust a tenant_id
 * coming from the client — derive it from the authenticated session.
 */
export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('Service-role client instantiated in the browser — security bug.');
  }
  const { supabaseUrl, serviceRoleKey } = getServerEnv();
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Service-role env not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local (server-only).',
    );
  }
  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

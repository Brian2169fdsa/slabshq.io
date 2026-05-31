import 'server-only';

import { getServerEnv } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';

/**
 * Resolve the tenant_id for the current request.
 *
 * Phase 1 (now): falls back to DEMO_TENANT_ID so intelligence screens can
 *   render against a real tenant before full auth is wired.
 * Phase 1 (auth): derives tenant_id from the authenticated user's
 *   membership row. NEVER accept tenant_id from client input.
 */
export async function getCurrentTenantId(): Promise<string | null> {
  const { demoTenantId } = getServerEnv();

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      // TODO(auth): look up the membership/tenant for this user per
      // FRONTEND_INTEGRATION.md (table + column names). Until then, the
      // demo tenant keeps the intelligence layer live.
      return demoTenantId || null;
    }
  } catch {
    // Supabase not configured yet — fall through to demo tenant.
  }
  return demoTenantId || null;
}

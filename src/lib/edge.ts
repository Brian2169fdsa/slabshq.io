import 'server-only';

import { getServerEnv } from '@/lib/env';

/**
 * Server-side caller for Supabase edge functions (guide §5).
 * Base: <SUPABASE_URL>/functions/v1/<fn>. Headers per the guide.
 * Runs server-side only so keys never reach the browser. We send the
 * service-role key (valid for both Authorization and apikey server-side);
 * the anon key is used when present for the apikey header.
 */
export async function callEdge<T = unknown>(
  fn: string,
  body: Record<string, unknown>,
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  const { functionsUrl, serviceRoleKey, anonKey } = getServerEnv();
  if (!functionsUrl || !serviceRoleKey) {
    return { ok: false, status: 503, data: null, error: 'edge functions not configured (missing URL or service role key)' };
  }
  try {
    const res = await fetch(`${functionsUrl}/${fn}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: anonKey || serviceRoleKey,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const data = (await res.json().catch(() => null)) as T | null;
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    return { ok: false, status: 502, data: null, error: e instanceof Error ? e.message : 'network error' };
  }
}

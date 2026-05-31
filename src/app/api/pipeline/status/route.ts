import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentTenantId } from '@/lib/tenant';
import { isSupabaseConfigured } from '@/lib/env';

/**
 * Poll target for the pipeline trigger (guide §5 step 2).
 * Reads pipeline_runs by id; status ∈ {queued, running, completed, failed}.
 * On completed, `result` holds the run summary.
 */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ ok: false, error: 'missing id' }, { status: 400 });

  const tenantId = await getCurrentTenantId();
  if (!isSupabaseConfigured || !tenantId) {
    return NextResponse.json({ ok: false, error: 'not configured' }, { status: 503 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('pipeline_runs')
      .select('status,result,error')
      .eq('id', id)
      .eq('tenant_id', tenantId) // scope even single-row reads
      .single();
    if (error || !data) {
      return NextResponse.json({ ok: false, error: error?.message ?? 'not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, ...data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'error' }, { status: 502 });
  }
}

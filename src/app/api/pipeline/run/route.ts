import { NextResponse } from 'next/server';
import { getCurrentTenantId } from '@/lib/tenant';
import { callEdge } from '@/lib/edge';

/**
 * Trigger the crawl/score pipeline (guide §5, the only async flow).
 * POST -> trigger-pipeline { tenant_id, kind } -> { request_id, status:"queued" }.
 * The client then polls /api/pipeline/status?id=<request_id>.
 *
 * Server-side only; the service-role key never leaves this process.
 */
export async function POST(req: Request) {
  const tenantId = await getCurrentTenantId();
  if (!tenantId) {
    return NextResponse.json({ ok: false, status: 'no_tenant' }, { status: 400 });
  }
  const kind = (await req.json().catch(() => ({})))?.kind === 'recrawl' ? 'recrawl' : 'pipeline';

  const r = await callEdge<{ request_id: string; status: string }>('trigger-pipeline', {
    tenant_id: tenantId,
    kind,
  });

  if (!r.ok || !r.data) {
    return NextResponse.json(
      { ok: false, status: 'not_configured', message: r.error ?? 'trigger-pipeline failed' },
      { status: r.status },
    );
  }
  return NextResponse.json({ ok: true, requestId: r.data.request_id, status: r.data.status });
}

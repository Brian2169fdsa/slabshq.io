import { NextResponse } from 'next/server';
import { getCurrentTenantId } from '@/lib/tenant';
import { callEdge } from '@/lib/edge';

/**
 * CSV import (guide §5): POST raw CSV text -> import-sales-csv
 * { tenant_id, csv, platform? }. Header row required; dedups by
 * item_uid+sale_date+sale_price. Server-side so keys aren't exposed.
 */
export async function POST(req: Request) {
  const tenantId = await getCurrentTenantId();
  if (!tenantId) return NextResponse.json({ ok: false, error: 'no tenant' }, { status: 400 });

  const { csv, platform } = (await req.json().catch(() => ({}))) as { csv?: string; platform?: string };
  if (!csv || csv.trim().length === 0) {
    return NextResponse.json({ ok: false, error: 'empty csv' }, { status: 400 });
  }

  const r = await callEdge<{ received: number; inserted: number; skipped_duplicates: number; errors: string[] }>(
    'import-sales-csv',
    { tenant_id: tenantId, csv, ...(platform ? { platform } : {}) },
  );
  if (!r.ok || !r.data) {
    return NextResponse.json({ ok: false, error: r.error ?? 'import failed' }, { status: r.status });
  }
  return NextResponse.json({ ok: true, ...r.data });
}

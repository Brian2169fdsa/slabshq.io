import { NextResponse } from 'next/server';
import { getCurrentTenantId } from '@/lib/tenant';
import { callEdge } from '@/lib/edge';

/**
 * AI Assistant (guide §5): POST { message } (or { messages }) ->
 * assistant edge fn { tenant_id, message } -> { reply, model, usage }.
 * Grounded server-side on the tenant's qualified items / top listings /
 * inventory. Server-side call keeps keys off the client.
 */
export async function POST(req: Request) {
  const tenantId = await getCurrentTenantId();
  if (!tenantId) return NextResponse.json({ ok: false, error: 'no tenant' }, { status: 400 });

  const body = (await req.json().catch(() => ({}))) as {
    message?: string;
    messages?: { role: string; content: string }[];
  };
  if (!body.message && !body.messages) {
    return NextResponse.json({ ok: false, error: 'message required' }, { status: 400 });
  }

  const r = await callEdge<{ reply: string; model: string; usage: unknown }>('assistant', {
    tenant_id: tenantId,
    ...(body.messages ? { messages: body.messages } : { message: body.message }),
  });
  if (!r.ok || !r.data) {
    return NextResponse.json({ ok: false, error: r.error ?? 'assistant unavailable' }, { status: r.status });
  }
  return NextResponse.json({ ok: true, reply: r.data.reply });
}

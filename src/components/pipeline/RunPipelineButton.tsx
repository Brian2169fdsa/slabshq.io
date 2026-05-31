'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

type State = 'idle' | 'running' | 'done' | 'error';

export function RunPipelineButton({ kind = 'pipeline' }: { kind?: 'pipeline' | 'recrawl' }) {
  const [state, setState] = useState<State>('idle');
  const [msg, setMsg] = useState('');
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function poll(requestId: string, attempt = 0) {
    if (attempt > 40) {
      setState('error');
      setMsg('Timed out waiting for the run to finish.');
      return;
    }
    const res = await fetch(`/api/pipeline/status?id=${encodeURIComponent(requestId)}`);
    const body = await res.json().catch(() => ({}));
    if (body.ok && (body.status === 'completed' || body.status === 'failed')) {
      if (body.status === 'completed') {
        setState('done');
        setMsg('Run complete — refreshing crawl logs…');
        router.refresh();
      } else {
        setState('error');
        setMsg(body.error ?? 'Pipeline run failed.');
      }
      return;
    }
    setMsg(`Running… (${body.status ?? 'queued'})`);
    timer.current = setTimeout(() => poll(requestId, attempt + 1), 3000);
  }

  async function run() {
    setState('running');
    setMsg('Queuing run…');
    try {
      const res = await fetch('/api/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind }),
      });
      const body = await res.json();
      if (res.ok && body.ok && body.requestId) {
        poll(body.requestId);
      } else {
        setState('error');
        setMsg(body.message ?? 'Trigger not configured yet.');
      }
    } catch {
      setState('error');
      setMsg('Network error contacting pipeline trigger.');
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {msg && (
        <span style={{ fontSize: 12, color: state === 'error' ? 'var(--amber)' : 'var(--text-2)', fontWeight: 600, maxWidth: 320 }}>
          {msg}
        </span>
      )}
      <button className="btn btn-primary" type="button" onClick={run} disabled={state === 'running'}>
        <RefreshCw size={16} className={state === 'running' ? 'spin' : undefined} />
        {state === 'running' ? 'Running…' : kind === 'recrawl' ? 'Re-crawl' : 'Run Pipeline Now'}
      </button>
    </div>
  );
}

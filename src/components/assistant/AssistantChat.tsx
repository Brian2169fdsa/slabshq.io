'use client';

import { useState } from 'react';
import { Sparkles, Send, User } from 'lucide-react';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED = [
  'Show me my best margins',
  "What's trending up?",
  'Any deals below market right now?',
  "How's my Pokémon segment?",
];

export function AssistantChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    setInput('');
    setNote('');
    const next: Msg[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setBusy(true);
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const body = await res.json();
      if (res.ok && body.ok) {
        setMessages((m) => [...m, { role: 'assistant', content: body.reply }]);
      } else {
        setNote(body.error ?? 'Assistant not configured yet — add Supabase keys to .env.local.');
      }
    } catch {
      setNote('Network error contacting the assistant.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 460 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
        {messages.length === 0 && (
          <div style={{ color: 'var(--text-3)', fontWeight: 500, margin: 'auto', textAlign: 'center' }}>
            <span className="kpi-ic blue" style={{ width: 44, height: 44, borderRadius: 12, margin: '0 auto 12px' }}>
              <Sparkles size={20} />
            </span>
            <div>Ask about your live listings, margins, and segments.</div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span
              className="kpi-ic blue"
              style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: m.role === 'user' ? 'var(--surface-alt)' : undefined }}
            >
              {m.role === 'user' ? <User size={15} /> : <Sparkles size={15} />}
            </span>
            <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text)', paddingTop: 4, whiteSpace: 'pre-wrap' }}>{m.content}</div>
          </div>
        ))}
        {busy && <div style={{ color: 'var(--text-3)', fontSize: 13, paddingLeft: 40 }}>Thinking…</div>}
      </div>

      {note && <div style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 600 }}>{note}</div>}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {SUGGESTED.map((s) => (
          <button key={s} className="btn btn-outline btn-sm" type="button" disabled={busy} onClick={() => send(s)}>
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        style={{ display: 'flex', gap: 8 }}
      >
        <div className="search" style={{ flex: 1, maxWidth: '100%' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What should I buy this week?"
            disabled={busy}
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={busy || !input.trim()}>
          <Send size={16} /> Send
        </button>
      </form>
    </div>
  );
}

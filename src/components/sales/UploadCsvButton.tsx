'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';

export function UploadCsvButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMsg('Uploading…');
    try {
      const csv = await file.text();
      const res = await fetch('/api/sales/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv }),
      });
      const body = await res.json();
      if (res.ok && body.ok) {
        setMsg(`Imported ${body.inserted}/${body.received} (skipped ${body.skipped_duplicates ?? 0} dupes).`);
        router.refresh();
      } else {
        setMsg(body.error ?? 'Import not configured yet.');
      }
    } catch {
      setMsg('Could not read or upload file.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {msg && <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600, maxWidth: 320 }}>{msg}</span>}
      <input ref={inputRef} type="file" accept=".csv,text/csv" onChange={onFile} style={{ display: 'none' }} />
      <button className="btn btn-primary" type="button" disabled={busy} onClick={() => inputRef.current?.click()}>
        <Upload size={16} /> {busy ? 'Uploading…' : 'Upload CSV'}
      </button>
    </div>
  );
}

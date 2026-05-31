import { CheckCircle2, Sparkles } from 'lucide-react';
import { getCrawlLogs } from '@/lib/data/pipeline';
import { DataSourceBadge } from '@/components/DataSourceBadge';
import { RunPipelineButton } from '@/components/pipeline/RunPipelineButton';

export const dynamic = 'force-dynamic';

export default async function PipelinePage() {
  const { logs, source } = await getCrawlLogs();
  const totalFound = logs.reduce((s, l) => s + l.found, 0);

  return (
    <section className="screen show stagger">
      <div className="page-head">
        <div>
          <h1 className="page-title">
            Pipeline Status <span className="badge green dot">HEALTHY</span> <DataSourceBadge source={source} />
          </h1>
          <p className="page-sub">Last run: 2h ago <span className="sep" /> {logs.length} sources <span className="sep" /> {totalFound} items found</p>
        </div>
        <div className="head-actions">
          <RunPipelineButton />
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="tbl">
          <thead><tr><th>Source</th><th>Last Run</th><th>Found</th><th>Inserted</th><th>Updated</th><th>Status</th></tr></thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td><b>{l.source}</b></td>
                <td>{l.started_at}</td>
                <td>{l.found}</td>
                <td>{l.inserted}</td>
                <td>{l.updated}</td>
                <td>
                  <span className="badge green" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={12} /> {l.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="insight">
        <span className="ic"><Sparkles size={18} /></span>
        <p><b>eBay</b> dominates <span className="hl">72% of feed</span>. TCGplayer added new listings this cycle.</p>
      </div>
    </section>
  );
}

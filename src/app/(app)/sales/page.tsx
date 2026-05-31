import { Receipt, TrendingUp, Percent, Calendar, Sparkles } from 'lucide-react';
import { getSales } from '@/lib/data/sales';
import { DataSourceBadge } from '@/components/DataSourceBadge';
import { ProfitChart } from '@/components/sales/ProfitChart';
import { UploadCsvButton } from '@/components/sales/UploadCsvButton';

export const dynamic = 'force-dynamic';

export default async function SalesPage() {
  const { sales, source } = await getSales();
  // gross_profit is authoritative; null => "community baseline" (cost unknown).
  const withProfit = sales.filter((r) => r.gross_profit != null);
  const lifetimeProfit = withProfit.reduce((s, r) => s + (r.gross_profit as number), 0);
  const avgMargin =
    withProfit.length > 0
      ? withProfit.reduce((s, r) => s + ((r.gross_profit as number) / r.sale_price) * 100, 0) / withProfit.length
      : 0;
  const money = (n: number) => '$' + n.toLocaleString('en-US');

  return (
    <section className="screen show stagger">
      <div className="page-head">
        <div>
          <h1 className="page-title">Sales History <DataSourceBadge source={source} /></h1>
          <p className="page-sub">{sales.length} sales · feeds the qualification engine</p>
        </div>
        <div className="head-actions">
          <UploadCsvButton />
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi"><div className="kpi-top"><span className="kpi-label">Total Sales</span><span className="kpi-ic blue"><Receipt size={16} /></span></div><div className="kpi-val blue">{sales.length}</div></div>
        <div className="kpi green"><div className="kpi-top"><span className="kpi-label">Lifetime Profit</span><span className="kpi-ic green"><TrendingUp size={16} /></span></div><div className="kpi-val green">{money(lifetimeProfit)}</div></div>
        <div className="kpi"><div className="kpi-top"><span className="kpi-label">Avg Margin</span><span className="kpi-ic blue"><Percent size={16} /></span></div><div className="kpi-val">{avgMargin.toFixed(1)}%</div></div>
        <div className="kpi amber"><div className="kpi-top"><span className="kpi-label">Avg Days to Sell</span><span className="kpi-ic amber"><Calendar size={16} /></span></div><div className="kpi-val">{Math.round(sales.reduce((s, r) => s + (r.days_to_sell ?? 0), 0) / (sales.length || 1))}</div></div>
      </div>

      <div className="card">
        <div className="card-head"><h3 className="card-title">Profit Over Time</h3></div>
        <ProfitChart
          labels={['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']}
          values={[1450, 1680, 1320, 2100, 1890, 2340, 2680, 2210, 3050, 4100, 3420, 3760]}
        />
      </div>

      <div className="insight">
        <span className="ic"><Sparkles size={18} /></span>
        <p>Your <b>Charizard PSA 10s</b> average <span className="hl">18% margin</span> and sell in <span className="hl">12 days</span> — your strongest performer.</p>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="tbl">
          <thead><tr><th>Item</th><th>Grade</th><th>Sold</th><th>Gross Profit</th><th>Days</th><th>Platform</th></tr></thead>
          <tbody>
            {sales.map((r) => (
              <tr key={r.id}>
                <td><b>{r.name}</b></td>
                <td>{r.grade}</td>
                <td>{money(r.sale_price)}</td>
                <td style={{ color: r.gross_profit != null ? 'var(--green-dark)' : 'var(--text-3)', fontWeight: 700 }}>
                  {r.gross_profit != null ? '+' + money(r.gross_profit) : 'baseline'}
                </td>
                <td>{r.days_to_sell ?? '—'}</td>
                <td>{r.platform}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

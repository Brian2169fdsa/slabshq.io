import { Package, DollarSign, Clock, AlertTriangle, Plus } from 'lucide-react';
import { getInventory } from '@/lib/data/inventory';
import { DataSourceBadge } from '@/components/DataSourceBadge';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const { items, source } = await getInventory();
  const value = items.reduce((s, i) => s + (i.market_value ?? 0), 0);
  const capitalAtRisk = items.reduce((s, i) => s + (i.purchase_price ?? 0), 0);
  const money = (n: number) => '$' + n.toLocaleString('en-US');

  return (
    <section className="screen show stagger">
      <div className="page-head">
        <div>
          <h1 className="page-title">My Inventory <DataSourceBadge source={source} /></h1>
          <p className="page-sub">{items.length} items tracked</p>
        </div>
        <div className="head-actions">
          {/* NEEDS-WIRING: Add-to-Inventory flow -> insert inventory_items */}
          <button className="btn btn-primary" type="button"><Plus size={16} /> Add Item</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-top"><span className="kpi-label">Total Items</span><span className="kpi-ic blue"><Package size={16} /></span></div>
          <div className="kpi-val blue">{items.length}</div>
        </div>
        <div className="kpi green">
          <div className="kpi-top"><span className="kpi-label">Inventory Value</span><span className="kpi-ic green"><DollarSign size={16} /></span></div>
          <div className="kpi-val green">{money(value)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-top"><span className="kpi-label">Listed</span><span className="kpi-ic blue"><Clock size={16} /></span></div>
          <div className="kpi-val">{items.filter((i) => i.status === 'Listed').length}</div>
        </div>
        <div className="kpi amber">
          <div className="kpi-top"><span className="kpi-label">Capital at Risk</span><span className="kpi-ic amber"><AlertTriangle size={16} /></span></div>
          <div className="kpi-val">{money(capitalAtRisk)}</div>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Item</th><th>Grade</th><th>Cost</th><th>Market</th>
              <th>Unrealized P/L</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => {
              const pl = (i.market_value ?? 0) - (i.purchase_price ?? 0);
              return (
                <tr key={i.id}>
                  <td><b>{i.name}</b><div style={{ fontSize: 12, color: 'var(--text-3)' }}>{i.set} · {i.number}</div></td>
                  <td>{i.grade}</td>
                  <td>{money(i.purchase_price ?? 0)}</td>
                  <td>{money(i.market_value ?? 0)}</td>
                  <td style={{ color: pl >= 0 ? 'var(--green-dark)' : 'var(--red)', fontWeight: 700 }}>
                    {pl >= 0 ? '+' : '−'}{money(Math.abs(pl))}
                  </td>
                  <td><span className={`badge ${i.status === 'Listed' ? 'blue' : 'gray'}`}>{i.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

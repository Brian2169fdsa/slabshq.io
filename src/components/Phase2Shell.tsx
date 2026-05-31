import { Construction } from 'lucide-react';

/**
 * Honest Phase-2 placeholder. These screens exist in the design prototype
 * but have NO backend in the current 11-table schema (storefront, orders,
 * customers, admin, billing). Marked clearly so a demo never implies they're
 * functional. The visual port is deferred until Phase 2.
 */
export function Phase2Shell({ title, blurb }: { title: string; blurb: string }) {
  return (
    <section className="screen show">
      <div className="page-head">
        <div>
          <h1 className="page-title">
            {title} <span className="badge amber" style={{ verticalAlign: 'middle' }}>PHASE 2</span>
          </h1>
          <p className="page-sub">Designed in the prototype · backend not yet built</p>
        </div>
      </div>
      <div className="card card-pad" style={{ textAlign: 'center', padding: '56px 24px' }}>
        <span className="kpi-ic blue" style={{ width: 48, height: 48, borderRadius: 12, margin: '0 auto 16px' }}>
          <Construction size={22} />
        </span>
        <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>{title} is a Phase-2 surface</h3>
        <p style={{ color: 'var(--text-2)', fontWeight: 500, maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>{blurb}</p>
      </div>
    </section>
  );
}

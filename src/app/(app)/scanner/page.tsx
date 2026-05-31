import { Search, SlidersHorizontal } from 'lucide-react';
import { getListings } from '@/lib/data/listings';
import { ListingPair } from '@/components/ListingPair';
import { DataSourceBadge } from '@/components/DataSourceBadge';

export const dynamic = 'force-dynamic';

const FILTERS = ['Category', 'Condition Grade', 'Price Range', 'Score Tier', 'Source', 'Sort by'];

export default async function ScannerPage() {
  const { listings, source } = await getListings();
  const strong = listings.filter((l) => l.score >= 80).length;

  return (
    <section className="screen show stagger">
      <div className="page-head">
        <div>
          <h1 className="page-title">Market Scanner <DataSourceBadge source={source} /></h1>
          <p className="page-sub">
            {listings.length} listings tracked <span className="sep" />{' '}
            <span style={{ color: 'var(--green-dark)', fontWeight: 700 }}>{strong} scoring Strong</span>
          </p>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 18 }}>
        <div className="search" style={{ maxWidth: '100%', marginBottom: 14 }}>
          <Search size={17} />
          {/* NEEDS-WIRING: client-side filter / Supabase full-text over hunting_listings */}
          <input placeholder="Search any card, set, or player..." />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <button key={f} className="btn btn-outline btn-sm" type="button">
              <SlidersHorizontal size={14} /> {f}
            </button>
          ))}
        </div>
      </div>

      <div className="pairs">
        {listings.map((l) => (
          <ListingPair key={l.id} l={l} />
        ))}
      </div>
    </section>
  );
}

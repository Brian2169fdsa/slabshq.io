import Link from 'next/link';
import { Zap, SlidersHorizontal, Flame, TrendingUp, Target, Wallet, ArrowUpRight, Sparkles } from 'lucide-react';
import { getListings, computeKpis } from '@/lib/data/listings';
import { ListingPair } from '@/components/ListingPair';
import { DashChart } from '@/components/dashboard/DashChart';
import { DataSourceBadge } from '@/components/DataSourceBadge';
import { RunPipelineButton } from '@/components/pipeline/RunPipelineButton';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { listings, source } = await getListings();
  const kpi = computeKpis(listings);
  const belowMarket = listings.filter((l) => l.below_market).length;
  const top = listings.slice(0, 6);
  const money = (n: number) => '$' + n.toLocaleString('en-US');

  return (
    <section className="screen show stagger">
      <div className="page-head">
        <div>
          <h1 className="page-title">
            <span className="slab-frame" style={{ width: 24, height: 32, borderWidth: 2 }}>
              <Zap size={14} />
            </span>{' '}
            Pokémon TCG
            <DataSourceBadge source={source} />
          </h1>
          <p className="page-sub">
            Last crawl: 2 hours ago <span className="sep" /> {listings.length} listings tracked{' '}
            <span className="sep" />{' '}
            <span style={{ color: 'var(--green-dark)', fontWeight: 700 }}>{kpi.strongCount} scoring Strong</span>
          </p>
        </div>
        <div className="head-actions">
          <RunPipelineButton kind="recrawl" />
          <Link className="btn btn-outline" href="/settings">
            <SlidersHorizontal size={16} /> Configure
          </Link>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-top"><span className="kpi-label">Strong Listings</span><span className="kpi-ic blue"><Flame size={16} /></span></div>
          <div className="kpi-val blue">{kpi.strongCount}</div>
          <div className="kpi-sub"><ArrowUpRight size={13} style={{ color: 'var(--green)' }} /> Score &gt; 80</div>
        </div>
        <div className="kpi green">
          <div className="kpi-top"><span className="kpi-label">Peak Monthly Profit</span><span className="kpi-ic green"><TrendingUp size={16} /></span></div>
          <div className="kpi-val green">{money(kpi.peakProfit)}<small style={{ fontSize: 14, color: 'var(--text-3)', fontWeight: 600 }}>/mo</small></div>
          <div className="kpi-sub">{kpi.peakProfitName}</div>
        </div>
        <div className="kpi">
          <div className="kpi-top"><span className="kpi-label">Score Coverage</span><span className="kpi-ic blue"><Target size={16} /></span></div>
          <div className="kpi-val">{kpi.scoreCoverage}%</div>
          <div className="kpi-bar"><div style={{ width: `${kpi.scoreCoverage}%` }} /></div>
        </div>
        <div className="kpi amber">
          <div className="kpi-top"><span className="kpi-label">Capital to Deploy</span><span className="kpi-ic amber"><Wallet size={16} /></span></div>
          <div className="kpi-val">{money(kpi.capitalToDeploy)}</div>
          <div className="kpi-sub">{kpi.buyNowCount} Buy Now listings ready</div>
        </div>
      </div>

      <DashChart listings={listings} />

      <div className="insight">
        <span className="ic"><Sparkles size={18} /></span>
        <p>
          <b>{kpi.peakProfitName}</b> leads at <span className="hl">{money(kpi.peakProfit)}/mo</span> —{' '}
          <span className="hl">{belowMarket} listings</span> are currently <b>Below Market</b>. Act fast before the spread closes.
        </p>
      </div>

      <div className="sec-label">Top Opportunities <span className="ct">{top.length} shown</span></div>
      <div className="pairs">
        {top.map((l) => (
          <ListingPair key={l.id} l={l} />
        ))}
      </div>
    </section>
  );
}

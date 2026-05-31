import { Bookmark, Gavel, Image as ImageIcon, ExternalLink } from 'lucide-react';
import type { HuntingListing } from '@/lib/types';
import { SRC_META } from '@/lib/mock';

function tierLabel(t: HuntingListing['tier']) {
  return t === 'strong' ? 'Strong' : t === 'good' ? 'Good' : 'Fair';
}

function badgeFor(l: HuntingListing): { t: string; c: 'blue' | 'green' | 'gray' } {
  if (l.below_market) return { t: 'Below Market', c: 'blue' };
  if (l.tier === 'strong') return { t: 'Strong', c: 'blue' };
  if (l.tier === 'good') return { t: 'Trending Up', c: 'green' };
  return { t: 'Watch', c: 'gray' };
}

function srcName(src: string) {
  return src === 'ebay' ? 'eBay' : src === 'tcgplayer' ? 'TCGplayer' : 'PWCC';
}

export function ListingPair({ l }: { l: HuntingListing }) {
  const s = SRC_META[l.source] ?? { label: l.source, color: '#64748B', short: l.source.slice(0, 2) };
  const badge = badgeFor(l);
  const tl = tierLabel(l.tier);
  const meta = [l.number, l.set].filter(Boolean).join(' · ');

  return (
    <div className="pair">
      <div className="lcard">
        <div className="lc-top">
          <span className={`score-pill ${l.tier}`}>
            <span className="n">{l.score}</span> Score · {tl}
          </span>
          <span className={`badge ${badge.c} dot`}>{badge.t}</span>
        </div>
        <h3 className="lc-name">{l.name}</h3>
        <div className="lc-meta">{meta}</div>
        <div className="lc-price">
          ${l.price.toLocaleString('en-US', { minimumFractionDigits: 2 })} <small>asking</small>
        </div>
        <div className="lc-metrics">
          <div>
            <div className="mv green">${l.est_monthly_profit}/mo</div>
            <div className="ml">Est. Profit</div>
          </div>
          <div>
            <div className="mv blue">{l.margin_pct}%</div>
            <div className="ml">Margin</div>
          </div>
          <div>
            <div className="mv">${l.max_bid}</div>
            <div className="ml">Max Bid</div>
          </div>
        </div>
        <div className="lc-foot">
          <button className="btn btn-outline btn-sm" type="button">
            <Bookmark size={15} /> Watch
          </button>
          <button className="btn btn-primary btn-sm" type="button">
            <Gavel size={15} /> Set Max Bid
          </button>
        </div>
      </div>
      <div className="rcard">
        <div className="rc-img">
          <ImageIcon size={28} />
          <span className={`badge ${l.tier === 'strong' ? 'blue' : l.tier === 'good' ? 'green' : 'gray'} tier`}>{tl}</span>
        </div>
        <div className="rc-body">
          <div className="rc-src">
            <span className="favicon" style={{ background: s.color }}>{s.short}</span>
            <span className="dom">{s.label}</span>
          </div>
          <div className="rc-title">{l.source_title}</div>
          <div className="rc-cond">
            {l.listed_at}
            <span
              className="sep"
              style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-3)', display: 'inline-block' }}
            />{' '}
            Condition: {l.condition}
          </div>
          <a className="rc-link" href={l.source_url ?? '#'} target="_blank" rel="noreferrer">
            Open on {srcName(l.source)} <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}

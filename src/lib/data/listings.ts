import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentTenantId } from '@/lib/tenant';
import { isSupabaseConfigured } from '@/lib/env';
import { MOCK_LISTINGS } from '@/lib/mock';
import type { HuntingListing, DbHuntingListing, Tier } from '@/lib/types';

export interface ListingsResult {
  listings: HuntingListing[];
  /** 'live' = from Supabase, 'mock' = fallback (no creds / no rows / error). */
  source: 'live' | 'mock';
}

function sourceFromUrl(url: string | null): string {
  if (!url) return 'ebay';
  if (/tcgplayer/i.test(url)) return 'tcgplayer';
  if (/pwcc/i.test(url)) return 'pwcc';
  return 'ebay';
}

function tierFrom(strength: string | null, score: number): Tier {
  const s = (strength ?? '').toLowerCase();
  if (s.includes('strong')) return 'strong';
  if (s.includes('good') || s.includes('moderate')) return 'good';
  if (s.includes('fair') || s.includes('weak')) return 'fair';
  // fall back to score banding when strength is absent/unrecognized
  return score >= 90 ? 'strong' : score >= 80 ? 'good' : 'fair';
}

/** Map a raw hunting_listings row (real columns) to the stable UI shape. */
export function mapHuntingListing(r: DbHuntingListing): HuntingListing {
  const score = r.match_score ?? 0;
  const belowMarket =
    /below/i.test(r.price_position ?? '') || r.below_threshold === true;
  return {
    id: r.id,
    tenant_id: r.tenant_id,
    name: r.item_name ?? 'Unknown',
    set: r.variant ?? null,
    number: null,
    grade: r.condition_grade ?? null,
    grading_company: r.grading_company ?? null,
    condition: r.condition_grade ?? null,
    source: sourceFromUrl(r.url),
    source_title: [r.item_name, r.variant].filter(Boolean).join(' ') || null,
    source_url: r.url ?? '#',
    price: r.price ?? 0,
    score,
    tier: tierFrom(r.strength, score),
    est_monthly_profit: Math.round(r.monthly_profit ?? 0),
    margin_pct: r.margin_pct ?? 0,
    max_bid: Math.round(r.max_bid ?? 0),
    below_market: belowMarket,
    listed_at: null,
    image: r.primary_image ?? null,
  };
}

const COLS =
  'id,tenant_id,item_name,variant,condition_grade,grading_company,match_score,strength,price,monthly_profit,margin_pct,max_bid,price_position,below_threshold,expected_dom,expected_gross_dollars,url,primary_image,is_removed,is_purchased';

/**
 * Reads hunting_listings for the current tenant (REAL table).
 * Service-role server-side + explicit tenant scoping (guide §3/§4).
 */
export async function getListings(): Promise<ListingsResult> {
  const tenantId = await getCurrentTenantId();
  if (!isSupabaseConfigured || !tenantId) {
    return { listings: MOCK_LISTINGS, source: 'mock' };
  }
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('hunting_listings')
      .select(COLS)
      .eq('tenant_id', tenantId) // MANDATORY scope — service role bypasses RLS
      .eq('is_removed', false)
      .order('monthly_profit', { ascending: false })
      .limit(200);
    if (error || !data || data.length === 0) {
      return { listings: MOCK_LISTINGS, source: 'mock' };
    }
    return {
      listings: (data as unknown as DbHuntingListing[]).map(mapHuntingListing),
      source: 'live',
    };
  } catch {
    return { listings: MOCK_LISTINGS, source: 'mock' };
  }
}

export interface DashboardKpis {
  strongCount: number;
  peakProfit: number;
  peakProfitName: string;
  scoreCoverage: number;
  capitalToDeploy: number;
  buyNowCount: number;
}

export function computeKpis(listings: HuntingListing[]): DashboardKpis {
  const strong = listings.filter((l) => l.score >= 80);
  const peak = listings.reduce<HuntingListing | null>(
    (best, l) => (!best || l.est_monthly_profit > best.est_monthly_profit ? l : best),
    null,
  );
  const buyNow = listings.filter((l) => l.below_market);
  const scored = listings.filter((l) => l.score > 0).length;
  return {
    strongCount: strong.length,
    peakProfit: peak?.est_monthly_profit ?? 0,
    peakProfitName: peak?.name ?? '—',
    scoreCoverage: listings.length ? Math.round((scored / listings.length) * 100) : 0,
    capitalToDeploy: buyNow.reduce((sum, l) => sum + l.max_bid, 0),
    buyNowCount: buyNow.length,
  };
}

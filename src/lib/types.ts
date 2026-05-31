/**
 * Row types keyed to the REAL Supabase schema (the 11 tables that already
 * exist on the backend). Column names below are the reconciled mapping from
 * the design prototype's field names -> the real schema. Anything marked
 * `// TODO(contract)` must be confirmed against FRONTEND_INTEGRATION.md
 * before relying on it.
 */

export type Tier = 'strong' | 'good' | 'fair';

/**
 * UI shape for a listing card. The REAL hunting_listings columns differ
 * (match_score, strength, monthly_profit, item_name, condition_grade, url,
 * price_position, below_threshold, primary_image, …) and are mapped to this
 * shape in lib/data/listings.ts (mapHuntingListing). Components depend only
 * on this stable shape.
 */
export interface HuntingListing {
  id: string;
  tenant_id: string;
  name: string;            // <- item_name
  set: string | null;      // <- variant (descriptor)
  number: string | null;
  grade: string | null;    // <- condition_grade
  grading_company: string | null;
  condition: string | null; // <- condition_grade
  source: string;          // <- derived from url domain
  source_title: string | null;
  source_url: string | null; // <- url
  price: number;
  score: number;           // <- match_score
  tier: Tier;              // <- strength
  est_monthly_profit: number; // <- monthly_profit
  margin_pct: number;      // <- margin_pct
  max_bid: number;         // <- max_bid
  below_market: boolean;   // <- price_position / below_threshold
  listed_at: string | null;
  image: string | null;    // <- primary_image
}

/** Raw hunting_listings row as it exists in Supabase (per the guide §4). */
export interface DbHuntingListing {
  id: string;
  tenant_id: string;
  item_name: string | null;
  variant: string | null;
  condition_grade: string | null;
  grading_company: string | null;
  match_score: number | null;
  strength: string | null;
  price: number | null;
  monthly_profit: number | null;
  margin_pct: number | null;
  max_bid: number | null;
  price_position: string | null;
  below_threshold: boolean | null;
  expected_dom: number | null;
  expected_gross_dollars: number | null;
  url: string | null;
  primary_image: string | null;
  is_removed: boolean | null;
  is_purchased: boolean | null;
}

/** tenant_categories — collapses the doc's categories + category_config. */
export interface TenantCategory {
  id: string;
  tenant_id: string;
  key: string;
  name: string;
  enabled: boolean;
  sort_order: number;
  price_floor: number | null;
  price_ceiling: number | null;
  min_margin: number | null;
  min_monthly_profit: number | null;
  condition_grades: string[] | null;
  sub_segments: string[] | null;
}

/** items — canonical card identities (doc's "card_catalog"). */
export interface Item {
  id: string;
  category: string | null;
  name: string;
  set: string | null;
  number: string | null;
  variant: string | null;
}

/** crawl_logs — doc's pipeline_runs + pipeline_events. */
export interface CrawlLog {
  id: string;
  tenant_id: string;
  source: string;
  found: number;
  inserted: number;
  updated: number;
  status: string; // healthy | running | failed
  started_at: string;
  finished_at: string | null;
}

/** inventory_items — what the reseller owns. */
export interface InventoryItem {
  id: string;
  tenant_id: string;
  name: string;
  grade: string | null;
  grading_company: string | null;
  cert_number: string | null;
  set: string | null;
  number: string | null;
  purchase_date: string | null;
  purchase_source: string | null;
  purchase_price: number | null;
  market_value: number | null;
  asking_price: number | null;
  status: string; // Listed | Unlisted | Sold
  storage_location: string | null;
}

/**
 * sales_history (REAL columns: sale_price, gross_profit (nullable →
 * "community baseline"), sale_date, condition_grade, platform, item_uid,
 * attributes{dom,listed_date}, plus brand/item_name/variant from CSV).
 * `gross_profit` is authoritative for profit; there is NO purchase_price col.
 */
export interface SaleRecord {
  id: string;
  tenant_id: string;
  name: string;            // <- item_name
  grade: string | null;    // <- condition_grade
  sale_price: number;
  gross_profit: number | null; // null => community baseline (cost unknown)
  days_to_sell: number | null; // <- attributes.dom
  platform: string | null;
  sale_date: string | null;
}

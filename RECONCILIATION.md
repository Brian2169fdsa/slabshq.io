# SlabHQ Frontend — Reconciliation & Wiring Status

Next.js 14 (App Router) port of the design prototype, wired to the **real**
Supabase backend per `FRONTEND_INTEGRATION.md`. Two-repo architecture: this
frontend → Supabase cloud (tables + edge functions). The private Temporal
server is reached **only** through the `trigger-pipeline` edge function.

## Go live in 2 steps
1. `cp .env.example .env.local`
2. Paste the **anon** and **service-role** keys (Supabase dashboard → API).
   The project URL, functions base, and demo tenant are already defaulted.

Until then every screen renders on prototype sample data (clearly badged
**SAMPLE DATA**) and every edge action returns an honest "not configured"
message — nothing silently fakes success.

## Security boundary (verified)
- `SUPABASE_SERVICE_ROLE_KEY` has **no** `NEXT_PUBLIC_` prefix and lives behind
  `import 'server-only'` in `lib/supabase/admin.ts`, `lib/edge.ts`,
  `lib/tenant.ts`, and all `lib/data/*`. A client import is a build error.
- Verified: zero service-role / `createAdminClient` references in `.next/static`
  (client bundles). Only the anon key + public URL can reach the browser.
- All reads/writes run server-side, scoped by `tenant_id` (RLS bypass + manual
  scope), tenant hardcoded to `00000000-0000-0000-0000-000000000001` until auth.

## Name mismatches resolved (prototype → real schema)
Mapping is isolated in the data layer (`lib/data/*`) so components use one
stable shape. Real columns are taken from the integration guide §4.

| UI field | Real `hunting_listings` column |
|---|---|
| score | `match_score` |
| tier | `strength` (falls back to score banding) |
| est_monthly_profit | `monthly_profit` |
| margin / max_bid | `margin_pct` / `max_bid` |
| name | `item_name` |
| set/meta | `variant` |
| grade / condition | `condition_grade` |
| source | derived from `url` domain (no source column) |
| source_url | `url` |
| below_market | `price_position` (~below) OR `below_threshold` |
| image | `primary_image` |

Other tables: `sales_history` uses `gross_profit` (nullable → community
baseline; **no** purchase_price column) and `attributes.dom` for days-to-sell;
`inventory_items` uses `item_name`/`variant`/`current_market_value`/`grade` and
status `owned|listed|sold`; `crawl_logs` uses `items_found/inserted/updated` +
`created_at`. Doc-name traps avoided: `listings`+`listing_scores`→
`hunting_listings` (inline), `pipeline_runs/events`→`crawl_logs`,
`card_catalog`→`items`, Inngest/Trigger.dev→Temporal (via queue bridge).

## Screen-by-screen status
| Screen | Status | Backend |
|---|---|---|
| Dashboard | WIRED | `hunting_listings` (KPIs/cards/chart). TODO: layer `qualified_items` for coverage |
| Market Scanner | WIRED (read) | `hunting_listings`; filters/search = client-side TODO |
| Pipeline Status | WIRED | reads `crawl_logs`; Run/Re-crawl → `trigger-pipeline` + poll `pipeline_runs` |
| Sales History | WIRED | reads `sales_history`; Upload CSV → `import-sales-csv` |
| My Inventory | WIRED (read) | reads `inventory_items`. TODO: Add-item insert, image upload → Storage `item-images` |
| AI Assistant | WIRED | `assistant` edge fn (multi-turn) |
| Settings → Intelligence | TODO | `tenant_categories` CRUD + `tenants.config.scoring_mode` (shell now) |
| Storefront / Orders / Admin / Billing | PHASE 2 | no backend — clearly-marked shells |

## Edge functions wired (server-side via `lib/edge.ts`)
`trigger-pipeline` (+ `pipeline_runs` poll), `import-sales-csv`, `assistant`.
Available but not yet surfaced: `qualify-items`, `score-listings`,
`ingest-items`, `calibrate`.

## Next steps
- Add Supabase Auth → derive tenant from session, switch reads to RLS-scoped
  anon client (service role becomes optional).
- Inventory: Add-item write + image upload to Storage `item-images` (signed URL
  stored on `item_images.url`); market value via `item_uid` join.
- Scanner: client-side filter/sort over loaded listings.
- Settings Intelligence panel: `tenant_categories` CRUD + scoring mode.
- Port the marketing site (Home/Pricing/etc.) + Phase-2 screens.

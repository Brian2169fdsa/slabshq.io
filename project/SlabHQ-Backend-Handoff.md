# SlabHQ — Build & Backend Handoff

**What this is:** `SlabHQ Dashboard.html` is a complete, single-file front-end prototype of the SlabHQ platform — marketing site + logged-in app (12 screens) + a role/feature-aware Settings system. It is **100% front-end**: every number is hardcoded sample data, every chart is mock data, and nothing talks to a backend. Refreshing resets all state.

This document inventories **what exists in the UI** and **every gap that must be filled** to make it a real product on Supabase + connected systems. Hand this to the backend builder as the spec for the data model, services, and integrations.

---

## 1. Recommended architecture

| Layer | Recommendation |
|---|---|
| DB + Auth + Storage | **Supabase** (Postgres, Auth, Storage, Row-Level Security, Realtime, Edge Functions) |
| Background jobs / pipeline | A job runner — **Inngest** or **Trigger.dev** (or Supabase cron + queues) for crawl scheduling, scoring, notifications |
| Scrapers | **Apify** actors per source (eBay, TCGplayer); normalize → upsert |
| Marketplace APIs | **eBay** (Browse/Buy + Sell Inventory), **TCGplayer** API; PWCC has no public API (scrape) |
| Payments | **Stripe Billing** (tenant subscriptions) + **Stripe Connect** (tenant→customer payouts on storefront sales) |
| Email | **Resend** / **Postmark** (alerts, digests, invoices) |
| AI Assistant | **Anthropic Claude** with retrieval over the tenant's own listings/inventory/sales + tool calls |
| Hosting | Next.js (app + API routes/Edge) or your stack of choice; the prototype is framework-agnostic HTML |

**Multi-tenancy:** every business object is scoped by `tenant_id`. Enforce isolation with Supabase RLS keyed off the requesting user's membership. This is the single most important backend invariant.

---

## 2. What's built in the UI (front-end inventory)

### Marketing site (logged-out, the entry point)
- **Home** — hero + mini dashboard preview (Chart.js), problem cards, three-layer pitch (Intelligence / Storefront / Operations), how-it-works, feature showcase (Pokémon + sports data), stats band, testimonials, final CTA, footer
- **Product** — per-layer deep dive
- **Pricing** — 3 tiers (Starter $299 / Pro $799 / Enterprise $1,749), comparison table, FAQ accordion
- **Use Cases** — 4 audience cards
- **Log In / Sign Up** — branded auth screens (SSO buttons are decorative)

### App (logged-in) — 12 screens
Dashboard, Market Scanner, AI Assistant, My Inventory, Inventory Item Detail, Add-to-Inventory wizard (5 steps), Sales History, Pipeline Status, Public Storefront (customer preview), Fulfillment Queue, Add/Edit Product, Billing & Plans, Admin Panel, plus the **Settings** system (17 sub-panels), the **onboarding wizard** (4 steps), and a demo **role switcher** (Admin / Owner / Team) that re-shapes navigation.

### What actually works in the prototype (front-end logic only)
- Navigation & screen routing; marketing↔app mode switching; sign-out → marketing
- Role-based + feature-gated visibility (sidebar and Settings) — **this logic is solid and worth mirroring server-side**
- Charts render (Chart.js) on mock data
- Add/Edit Product **live profit calculator**; onboarding & add-item multi-step flows; FAQ accordion; checkboxes/toggles/sliders flip
- Storefront master toggle + Admin storefront flag drive real session state

### What is a stub (no data / no effect)
Search bars, all filters, AI Assistant input/send, every upload zone (CSV + images), "Run Pipeline", every Save/Publish, View/Edit/Impersonate, marketplace "Buy Now" links, all auth validation, and **persistence** (refresh = reset).

---

## 3. Data model (Supabase / Postgres)

Core tables — names are suggestions; all tenant-scoped tables need `tenant_id` + RLS.

### Identity & tenancy
- **tenants** — `id, name, slug, plan, storefront_enabled, commission_rate, status, created_at`
- **users** — `id, email, name, phone, avatar_url, created_at` (use Supabase Auth `auth.users`)
- **memberships** — `id, tenant_id, user_id, role(owner|manager|fulfillment|viewer), status, last_active_at` (the join that powers RLS + the permission matrix)
- **invitations** — `id, tenant_id, email, role, token, status, invited_by, created_at`

### Intelligence
- **categories** — `id, tenant_id, key, name, sort_order, enabled`
- **category_config** — `category_id, price_floor, price_ceiling, min_margin, min_monthly_profit, condition_grades text[], sub_segments text[], qualification_mode(auto|margin|baseline), min_sales_count, dollar_floor, dollar_floor_mode, confidence_threshold, weights jsonb {margin,velocity,volume,confidence}`
- **sources** — `id, key(ebay_sold|ebay_active|tcgplayer|pwcc), display_name`
- **category_sources** — `category_id, source_id, enabled`
- **card_catalog** — canonical card identities for autocomplete/matching: `id, category, name, set, number, variant`
- **listings** — `id, tenant_id, category_id, source_id, external_id, title, set, number, grade, grading_company, condition, price, url, image_url, first_seen, last_seen, status`
- **listing_scores** — `listing_id, score, tier, margin_pct, est_monthly_profit, max_bid, velocity, confidence, below_market bool, computed_at`
- **comps** — aggregated market data per card identity (sold history → market value + velocity)

### Inventory (shares photos with storefront)
- **inventory_items** — `id, tenant_id, category_id, name, brand, set, card_number, grade, grading_company, cert_number, purchase_price, purchase_date, purchase_source, market_value, asking_price, condition_notes, storage_location, status(listed|unlisted|sold), attributes jsonb, tags text[], created_at` (`days_held` derived)
- **item_images** — `id, tenant_id, item_id, url, thumb_url, is_primary, sort_order, image_type(front|back|corner|cert|defect|other), created_at`
- **item_documents** — `id, tenant_id, item_id, url, doc_type, filename, created_at`
- **item_events** — `id, item_id, type(purchased|listed|price_change|sold|note), data jsonb, created_at` (the provenance timeline)

### Sales history (feeds qualification)
- **sales_history** — `id, tenant_id, item_name, grade, brand, condition, purchase_price, sale_price, sale_date, platform, days_to_sell, margin`
- **sales_imports** — `id, tenant_id, filename, row_count, status, column_map jsonb, created_at`

### Storefront, orders, fulfillment
- **store_listings (products)** — `id, tenant_id, item_id?, name, category, set, grade, inventory_type(in_stock|sourced_to_order|consignment), shipping_window, source_link, expected_source_cost, list_price, suggested_price, channels jsonb, status(live|pending|draft), created_at`
- **orders** — `id, tenant_id, order_number, product_id, customer_id, sold_price, source_cost, profit, ship_by, status, tracking_number, sourced_at, packed_at, shipped_at, created_at`
- **order_source_options** — `order_id, source, price, url, is_best`
- **customers** — `id, tenant_id, name, email, location, order_count, ltv, status`

### Pipeline
- **pipeline_runs** — `id, tenant_id, source_id, cycle, found, inserted, updated, status, started_at, finished_at`
- **pipeline_events** — `id, tenant_id, run_id, type, message, created_at`

### Settings & config (one row per tenant unless noted)
- **store_config** — `tenant_id, name, logo_url, banner_url, accent_color, slug, custom_domain, about, policies`
- **listing_defaults** — `tenant_id, default_inventory_type, default_shipping_window, auto_pricing, default_markup, auto_relist`
- **payment_config** — `tenant_id, stripe_account_id, payout_schedule, currency, collect_tax, tax_rates jsonb`
- **shipping_config** — `tenant_id, profiles jsonb, free_threshold, insurance_threshold, handling_time, return_policy`
- **channel_connections** — `tenant_id, channel(ebay|tcgplayer), account_ref, connected, sync_inventory`
- **notification_prefs** — `membership_id, email_strong_listings, email_price_drops, email_pipeline_failures, email_daily_digest, in_app, score_threshold, margin_threshold, below_market_only`
- **user_prefs** — `membership_id, timezone, date_format, currency, theme`
- **notifications** — `id, tenant_id, user_id, type, payload jsonb, read, created_at`

### Billing & API
- **subscriptions** — `tenant_id, plan, stripe_subscription_id, status, renews_at, seats`
- **usage_meters** — `tenant_id, period, scrape_runs, api_calls, storage_bytes, seats_used`
- **invoices** — `id, tenant_id, amount, status, period, pdf_url, created_at`
- **api_keys** — `id, tenant_id, prefix, hash, last_used, revoked` (Enterprise)
- **webhooks** — `id, tenant_id, url, events text[], secret` (Enterprise)

### Platform admin (SlabHQ staff only — tenants never read these)
- **platform_flags** — `key, enabled`
- **tenant_overrides** — `tenant_id, feature, state(enable|disable|inherit)`
- **plan_config** — `plan, price, commission, seats, scan_frequency, scraper_cap`
- **grade_multipliers** — `grade, multiplier` (the PSA 10 = 1.20× table — platform default, hidden from tenants)
- **announcements** — `id, message, active`
- **system_settings** — `maintenance_mode, onboarding_defaults jsonb`

### Storage buckets
- `item-media` (item/product photos, tenant-prefixed paths `/{tenant_id}/{item_id}/{uuid}.jpg`, thumbnails via Supabase image transform)
- `item-docs` (receipts, COAs, grading docs)
- `store-assets` (logos, banners)

---

## 4. Services / engines to build (the real product)

1. **Scraper pipeline** — Apify actors per source → normalize → upsert `listings`; record `pipeline_runs`/`pipeline_events`. Scheduled per tenant by plan tier (daily / twice-daily / realtime); manual "Run now" trigger.
2. **Card identity resolution** — match raw listing titles to `card_catalog` (set, number, grade) so comps and inventory line up.
3. **Comp aggregation** — roll sold data into market value + velocity per identity (this is what `market_value` and below-market flags depend on).
4. **Scoring engine** — the core IP. Inputs: comps, tenant `category_config` (weights, qualification mode, thresholds, condition multipliers from `grade_multipliers`). Outputs `listing_scores` (score/tier/margin/est monthly profit/max bid/velocity/confidence/below_market). Must support **baseline mode** (no cost history) and **margin mode** (with sales history).
5. **Pricing suggestion** — the "AUTO" suggested price on Add Product + asking-price recommendations.
6. **AI Assistant** — Claude with retrieval over the tenant's `listings`/`listing_scores`/`inventory_items`/`sales_history` + tool calls (search deals, summarize segment, set max bid). Replace the canned conversation.
7. **CSV import** — parse upload, column mapper, write `sales_history`, re-run qualification.
8. **Image service** — signed-URL uploads to `item-media`, thumbnail generation, reorder/primary/delete; storefront reads the same rows.
9. **Storefront + checkout** — render public store from `store_config` + `store_listings`; Stripe checkout; on purchase create `order` + ranked `order_source_options` (query live source prices).
10. **Fulfillment** — order state machine (sourced→packed→shipped + tracking); ship-by timers; cheapest-source ranking.
11. **Multi-channel listing** — push/pull to eBay & TCGplayer Sell APIs; inventory sync (delist-everywhere on sale).
12. **Billing** — Stripe subscriptions + webhooks; **usage metering** (scrape runs, API calls, storage, seats); **plan-gating middleware** mirroring the UI's feature flags; Stripe Connect onboarding for payouts; commission calc on storefront sales (0/2/1%).
13. **Notifications** — dispatcher for the alert thresholds (score/margin/below-market), pipeline-failure alerts, daily digest, in-app feed.
14. **Auth & RLS** — Supabase Auth (email + Google/Apple OAuth); RLS policies enforcing tenant isolation and the role permission matrix.
15. **Admin platform service** — global flags, per-tenant overrides, plan/pricing config, scraper cost caps, grade-multiplier table, announcements, maintenance mode.

---

## 5. Roles & permissions (enforce server-side)

The UI already encodes this matrix; replicate it in RLS/policies:

| Permission | Owner | Manager | Fulfillment | Viewer |
|---|:--:|:--:|:--:|:--:|
| View intelligence | ✅ | ✅ | ✅ | ✅ |
| Edit categories & settings | ✅ | ✅ | — | — |
| Manage inventory | ✅ | ✅ | ✅ | — |
| Fulfill orders | ✅ | ✅ | ✅ | — |
| Manage store settings | ✅ | ✅ | — | — |
| View financials | ✅ | — | — | — |
| Invite others | ✅ | — | — | — |

Plus **SlabHQ Admin** (platform staff, separate from tenant roles) — sees Admin Settings + cross-tenant controls. The demo role switcher (Admin/Owner/Team) is a front-end convenience; real roles come from `memberships.role` + a platform-admin flag.

---

## 6. Per-screen wiring gaps (what each screen needs from the API)

| Screen | Needs |
|---|---|
| **Dashboard** | KPIs aggregate query; top-listings feed + scores; chart series; storefront mini-stats (today's orders/revenue) |
| **Market Scanner** | Full-text search + working filters (category/condition/price/score/source) over `listings`+`listing_scores`; pagination |
| **AI Assistant** | Live Claude endpoint with retrieval + tools; persist threads |
| **My Inventory** | List/query `inventory_items` with derived P/L, filters; row→detail |
| **Item Detail** | Read/write all fields; **real image upload** + reorder/primary/delete; tags & custom fields (jsonb); documents; provenance from `item_events`; "List on Store" carries images+details into a `store_listing` |
| **Add-to-Inventory** | Catalog autocomplete; image upload; create item (+ optional store listing) |
| **Sales History** | Query `sales_history`; profit chart; **CSV import** + column mapping |
| **Pipeline Status** | Live `pipeline_runs`/`events`; **Run-now** trigger; freshness |
| **Storefront (public)** | Render from `store_config`+`store_listings`; working filters; cart + checkout |
| **Fulfillment** | Orders feed; ranked `order_source_options`; state transitions + tracking capture |
| **Add/Edit Product** | Suggested price from pricing service; create/update `store_listings`; channel push; profit preview from real costs/fees |
| **Billing & Plans** | Live subscription, usage meters, invoices (Stripe); upgrade/downgrade/cancel |
| **Admin Panel** | Cross-tenant aggregates, MRR, per-tenant health from `pipeline_runs`; tenant feature toggles; impersonation |
| **Settings (all 17)** | Persist every panel to its config table; storefront master toggle flips `tenants.storefront_enabled`; plan-gated controls enforced server-side |
| **Onboarding** | Persist category selection + config; kick off first crawl |
| **Auth pages** | Real Supabase Auth (email + OAuth), validation, sessions; sign-up provisions tenant + owner membership + trial subscription |

---

## 7. Third-party integrations checklist
- [ ] Supabase project (DB + Auth + Storage + RLS + Edge Functions + Realtime)
- [ ] Apify (eBay + TCGplayer scraper actors)
- [ ] eBay developer app (Browse/Buy + Sell Inventory APIs, OAuth)
- [ ] TCGplayer API access
- [ ] Stripe Billing (products/prices for the 3 plans) + webhooks
- [ ] Stripe Connect (tenant payouts)
- [ ] Email provider (Resend/Postmark)
- [ ] Anthropic API (assistant)
- [ ] Job runner (Inngest/Trigger.dev) for scheduled crawls, scoring, digests
- [ ] Custom-domain handling for white-label stores (Enterprise)

---

## 8. Suggested build sequence
1. **Foundation** — Supabase, Auth + OAuth, tenants/memberships, RLS, settings persistence, real sign-up/login wiring.
2. **Intelligence core** — card catalog, one scraper (eBay), listings + comps + scoring engine → live Dashboard + Scanner + Pipeline.
3. **Inventory** — items CRUD, image upload + thumbnails, provenance, sales CSV import → qualification.
4. **Storefront & money** — store config, products, Stripe checkout, orders, fulfillment queue, Stripe Connect payouts, commission.
5. **AI Assistant** — Claude + retrieval + tools.
6. **Scale** — second scraper (TCGplayer/PWCC), multi-channel listing, Billing + usage metering + plan gating, Admin platform controls.
7. **Polish** — notifications/digests, webhooks + API keys, realtime updates, persistence everywhere.

---

## 9. Front-end stubs to swap for live calls (quick reference)
Search (top + scanner) · all filters · AI send + prompts · CSV upload (sales + onboarding) · image upload zones (item detail, add-item, product) · "Run Pipeline" · every Save/Publish/Update · View/Edit/Impersonate · marketplace Buy-Now links · auth validation · cross-session persistence (currently nothing survives refresh).

**Bottom line:** the front-end defines the full product surface, the exact data each screen expects, and the role/feature rules. The backlog is real infrastructure — Supabase schema + RLS, the scraping→scoring pipeline, Stripe (Billing + Connect), marketplace APIs, the AI retrieval layer, and wiring every stub above to live endpoints.

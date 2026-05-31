/**
 * Mock data ported from the design prototype (SlabHQ Dashboard.html).
 * Used as a graceful fallback so screens render before Supabase creds +
 * FRONTEND_INTEGRATION.md are wired. Shaped to the REAL row types so the
 * swap to live data is a no-op at the component layer.
 */
import type { HuntingListing, InventoryItem, SaleRecord, CrawlLog, Tier } from '@/lib/types';

const L = (
  score: number, tier: Tier, name: string, set: string, number: string,
  grade: string, source: string, source_title: string, price: number,
  est_monthly_profit: number, margin_pct: number, max_bid: number,
  below_market: boolean, listed_at: string,
): HuntingListing => ({
  id: `${name}-${grade}`.replace(/\s+/g, '-').toLowerCase(),
  tenant_id: 'mock', name, set, number, grade,
  grading_company: grade.split(' ')[0], condition: grade,
  source, source_title, source_url: '#', price,
  score, tier, est_monthly_profit, margin_pct, max_bid, below_market,
  listed_at, image: null,
});

export const MOCK_LISTINGS: HuntingListing[] = [
  L(94, 'strong', 'Charizard VMAX PSA 10', 'Darkness Ablaze', '220/264', 'PSA 10', 'ebay', '2021 Pokémon Charizard VMAX PSA 10 GEM MINT 220/264', 312.0, 847, 12.4, 291, true, 'Listed today'),
  L(98, 'strong', 'Pikachu Illustrator BGS 9', 'CoroCoro 1998', 'Promo', 'BGS 9', 'pwcc', '1998 Pokémon Pikachu Illustrator Promo BGS 9 MINT', 9850.0, 2100, 9.8, 9200, false, 'Listed 2d ago'),
  L(91, 'strong', 'Base Set Charizard PSA 9', 'Base Set Unlimited', '4/102', 'PSA 9', 'ebay', '1999 Pokémon Base Set Charizard #4 PSA 9 MINT Holo', 1240.0, 1240, 18.2, 1080, true, 'Listed 4h ago'),
  L(88, 'good', 'Umbreon VMAX Alt Art PSA 10', 'Evolving Skies', '215/203', 'PSA 10', 'tcgplayer', 'Umbreon VMAX Alternate Art Secret #215 PSA 10 GEM', 534.0, 634, 15.1, 470, false, 'Listed today'),
  L(90, 'strong', 'Lugia Neo Genesis PSA 10', 'Neo Genesis', '9/111', 'PSA 10', 'pwcc', '2000 Pokémon Neo Genesis Lugia #9 1st Ed PSA 10', 2890.0, 890, 11.0, 2600, true, 'Listed 1d ago'),
  L(76, 'fair', 'Blastoise Base Set PSA 8', 'Base Set Unlimited', '2/102', 'PSA 8', 'ebay', '1999 Pokémon Base Set Blastoise #2 PSA 8 NM-MINT Holo', 445.0, 445, 8.9, 390, false, 'Listed 6h ago'),
  L(72, 'fair', 'Mew VMAX PSA 10', 'Fusion Strike', '114/100', 'PSA 10', 'tcgplayer', 'Mew VMAX Alternate Art Secret #114 PSA 10 GEM MINT', 268.0, 312, 7.4, 235, false, 'Listed today'),
  L(85, 'good', 'Rayquaza VMAX Alt Art BGS 9.5', 'Evolving Skies', '218/203', 'BGS 9.5', 'ebay', 'Rayquaza VMAX Alt Art Secret #218 BGS 9.5 GEM MINT', 489.0, 567, 13.7, 430, false, 'Listed 3h ago'),
];

const I = (
  id: string, name: string, grade: string, company: string, cert: string,
  set: string, number: string, purchase_date: string, purchase_source: string,
  purchase_price: number, market_value: number, asking_price: number,
  status: string, storage_location: string,
): InventoryItem => ({
  id, tenant_id: 'mock', name, grade, grading_company: company, cert_number: cert,
  set, number, purchase_date, purchase_source, purchase_price, market_value,
  asking_price: asking_price || null, status, storage_location,
});

export const MOCK_INVENTORY: InventoryItem[] = [
  I('inv1', 'Charizard VMAX', 'PSA 10', 'PSA', '82041577', 'Darkness Ablaze', '020/189', 'Apr 2, 2026', 'eBay', 228, 312, 349, 'Listed', 'Slab Case A · Slot 12'),
  I('inv2', 'Pikachu Illustrator', 'BGS 9', 'BGS', '0014928761', 'CoroCoro Promo 1998', '—', 'Jan 18, 2026', 'PWCC', 9200, 9850, 11500, 'Listed', 'Safe A · Vault'),
  I('inv3', 'Base Set Charizard', 'PSA 9', 'PSA', '71203344', 'Base Set Unlimited', '4/102', 'Mar 11, 2026', 'eBay', 1080, 1240, 1399, 'Listed', 'Slab Case A · Slot 4'),
  I('inv4', 'Umbreon VMAX Alt Art', 'PSA 10', 'PSA', '83910022', 'Evolving Skies', '215/203', 'Apr 27, 2026', 'TCGplayer', 470, 534, 599, 'Listed', 'Slab Case B · Slot 8'),
  I('inv5', 'Lugia Neo Genesis 1st Ed', 'PSA 10', 'PSA', '66120938', 'Neo Genesis', '9/111', 'Feb 9, 2026', 'PWCC', 2600, 2890, 3200, 'Unlisted', 'Safe A · Vault'),
  I('inv6', 'Blastoise Base Set', 'PSA 8', 'PSA', '70044511', 'Base Set Unlimited', '2/102', 'May 8, 2026', 'eBay', 390, 362, 0, 'Unlisted', 'Slab Case A · Slot 2'),
  I('inv7', 'Mew VMAX Alt Art', 'PSA 10', 'PSA', '84221199', 'Fusion Strike', '114/100', 'May 14, 2026', 'TCGplayer', 235, 268, 299, 'Listed', 'Slab Case B · Slot 3'),
  I('inv8', 'Rayquaza VMAX Alt Art', 'BGS 9.5', 'BGS', '0015882104', 'Evolving Skies', '218/203', 'May 1, 2026', 'eBay', 430, 412, 0, 'Unlisted', 'Slab Case B · Slot 11'),
];

const S = (name: string, grade: string, purchase_price: number, sale_price: number, days_to_sell: number, platform: string): SaleRecord => ({
  id: `${name}-${sale_price}`.replace(/\s+/g, '-').toLowerCase(), tenant_id: 'mock',
  name, grade, sale_price, gross_profit: sale_price - purchase_price, days_to_sell, platform, sale_date: null,
});

export const MOCK_SALES: SaleRecord[] = [
  S('Charizard VMAX PSA 10', 'PSA 10', 289, 347, 11, 'eBay'),
  S('Base Set Charizard PSA 9', 'PSA 9', 1180, 1399, 14, 'PWCC'),
  S('Umbreon VMAX Alt PSA 10', 'PSA 10', 498, 580, 9, 'TCGplayer'),
  S('Gengar VMAX Alt PSA 10', 'PSA 10', 264, 312, 18, 'eBay'),
  S('Mewtwo GX SR PSA 10', 'PSA 10', 142, 178, 7, 'eBay'),
  S('Espeon GX SM Promo PSA 9', 'PSA 9', 96, 118, 21, 'TCGplayer'),
  S('Charizard VMAX PSA 10', 'PSA 10', 301, 362, 12, 'eBay'),
  S('Blastoise Base PSA 8', 'PSA 8', 402, 445, 26, 'eBay'),
];

export const MOCK_CRAWLS: CrawlLog[] = [
  { id: 'c1', tenant_id: 'mock', source: 'eBay', found: 612, inserted: 18, updated: 156, status: 'healthy', started_at: '2h ago', finished_at: '2h ago' },
  { id: 'c2', tenant_id: 'mock', source: 'TCGplayer', found: 235, inserted: 5, updated: 89, status: 'healthy', started_at: '2h ago', finished_at: '2h ago' },
];

export const SRC_META: Record<string, { label: string; color: string; short: string }> = {
  ebay: { label: 'ebay.com', color: '#E53238', short: 'eb' },
  tcgplayer: { label: 'tcgplayer.com', color: '#F37C20', short: 'TP' },
  pwcc: { label: 'pwccmarketplace.com', color: '#1A56DB', short: 'PW' },
};

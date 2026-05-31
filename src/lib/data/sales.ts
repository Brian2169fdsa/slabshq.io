import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentTenantId } from '@/lib/tenant';
import { isSupabaseConfigured } from '@/lib/env';
import { MOCK_SALES } from '@/lib/mock';
import type { SaleRecord } from '@/lib/types';

interface DbSale {
  id: string;
  tenant_id: string;
  item_name: string | null;
  condition_grade: string | null;
  sale_price: number | null;
  gross_profit: number | null;
  sale_date: string | null;
  platform: string | null;
  attributes: { dom?: number; listed_date?: string } | null;
}

function mapSale(r: DbSale): SaleRecord {
  return {
    id: r.id,
    tenant_id: r.tenant_id,
    name: r.item_name ?? 'Unknown',
    grade: r.condition_grade ?? null,
    sale_price: r.sale_price ?? 0,
    gross_profit: r.gross_profit, // nullable => community baseline
    days_to_sell: r.attributes?.dom ?? null,
    platform: r.platform ?? null,
    sale_date: r.sale_date ?? null,
  };
}

const COLS = 'id,tenant_id,item_name,condition_grade,sale_price,gross_profit,sale_date,platform,attributes';

export async function getSales(): Promise<{ sales: SaleRecord[]; source: 'live' | 'mock' }> {
  const tenantId = await getCurrentTenantId();
  if (!isSupabaseConfigured || !tenantId) return { sales: MOCK_SALES, source: 'mock' };
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('sales_history') // REAL TABLE
      .select(COLS)
      .eq('tenant_id', tenantId);
    if (error || !data || data.length === 0) return { sales: MOCK_SALES, source: 'mock' };
    return { sales: (data as unknown as DbSale[]).map(mapSale), source: 'live' };
  } catch {
    return { sales: MOCK_SALES, source: 'mock' };
  }
}

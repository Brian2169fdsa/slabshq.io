import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentTenantId } from '@/lib/tenant';
import { isSupabaseConfigured } from '@/lib/env';
import { MOCK_INVENTORY } from '@/lib/mock';
import type { InventoryItem } from '@/lib/types';

interface DbInventory {
  id: string;
  tenant_id: string;
  item_name: string | null;
  variant: string | null;
  grade: string | null;
  grading_company: string | null;
  cert_number: string | null;
  purchase_price: number | null;
  current_market_value: number | null;
  asking_price: number | null;
  status: string | null;
  storage_location: string | null;
}

function normStatus(s: string | null): string {
  const v = (s ?? '').toLowerCase();
  if (v === 'listed') return 'Listed';
  if (v === 'sold') return 'Sold';
  return 'Unlisted'; // 'owned' / anything else
}

function mapInventory(r: DbInventory): InventoryItem {
  return {
    id: r.id,
    tenant_id: r.tenant_id,
    name: r.item_name ?? 'Unknown',
    grade: r.grade ?? null,
    grading_company: r.grading_company ?? null,
    cert_number: r.cert_number ?? null,
    set: r.variant ?? null,
    number: null,
    purchase_date: null,
    purchase_source: null,
    purchase_price: r.purchase_price ?? null,
    market_value: r.current_market_value ?? null, // TODO(enhance): item_uid join for live market
    asking_price: r.asking_price ?? null,
    status: normStatus(r.status),
    storage_location: r.storage_location ?? null,
  };
}

const COLS =
  'id,tenant_id,item_name,variant,grade,grading_company,cert_number,purchase_price,current_market_value,asking_price,status,storage_location';

export async function getInventory(): Promise<{ items: InventoryItem[]; source: 'live' | 'mock' }> {
  const tenantId = await getCurrentTenantId();
  if (!isSupabaseConfigured || !tenantId) return { items: MOCK_INVENTORY, source: 'mock' };
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('inventory_items') // REAL TABLE
      .select(COLS)
      .eq('tenant_id', tenantId);
    if (error || !data || data.length === 0) return { items: MOCK_INVENTORY, source: 'mock' };
    return { items: (data as unknown as DbInventory[]).map(mapInventory), source: 'live' };
  } catch {
    return { items: MOCK_INVENTORY, source: 'mock' };
  }
}

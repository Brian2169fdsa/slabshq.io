import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentTenantId } from '@/lib/tenant';
import { isSupabaseConfigured } from '@/lib/env';
import { MOCK_CRAWLS } from '@/lib/mock';
import type { CrawlLog } from '@/lib/types';

interface DbCrawlLog {
  id: string;
  tenant_id: string;
  workflow_name: string | null;
  source: string | null;
  items_found: number | null;
  items_inserted: number | null;
  items_updated: number | null;
  items_removed: number | null;
  status: string | null;
  error_message: string | null;
  created_at: string;
}

function mapCrawl(r: DbCrawlLog): CrawlLog {
  return {
    id: r.id,
    tenant_id: r.tenant_id,
    source: r.source ?? r.workflow_name ?? 'pipeline',
    found: r.items_found ?? 0,
    inserted: r.items_inserted ?? 0,
    updated: r.items_updated ?? 0,
    status: r.status ?? 'unknown',
    started_at: r.created_at,
    finished_at: null,
  };
}

const COLS =
  'id,tenant_id,workflow_name,source,items_found,items_inserted,items_updated,items_removed,status,error_message,created_at';

export async function getCrawlLogs(): Promise<{ logs: CrawlLog[]; source: 'live' | 'mock' }> {
  const tenantId = await getCurrentTenantId();
  if (!isSupabaseConfigured || !tenantId) return { logs: MOCK_CRAWLS, source: 'mock' };
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('crawl_logs') // REAL TABLE (doc's pipeline_runs + pipeline_events)
      .select(COLS)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error || !data || data.length === 0) return { logs: MOCK_CRAWLS, source: 'mock' };
    return { logs: (data as unknown as DbCrawlLog[]).map(mapCrawl), source: 'live' };
  } catch {
    return { logs: MOCK_CRAWLS, source: 'mock' };
  }
}

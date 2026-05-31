/**
 * Honest indicator of where a screen's data came from. Renders nothing in
 * 'live' mode; in 'mock' mode it makes clear the screen is on fallback data
 * (no Supabase creds / no rows yet) so a demo never silently misleads.
 */
export function DataSourceBadge({ source }: { source: 'live' | 'mock' }) {
  if (source === 'live') return null;
  return (
    <span
      className="badge amber"
      style={{ marginLeft: 8, verticalAlign: 'middle' }}
      title="No Supabase connection yet — showing prototype sample data. Add creds + FRONTEND_INTEGRATION.md to go live."
    >
      SAMPLE DATA
    </span>
  );
}

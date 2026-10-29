import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * All account data access lives here, so it is easy to refine. Every
 * function fails soft: if a table is missing or a query errors, it
 * returns an empty result instead of crashing the page.
 *
 * Tables expected in the MySparkthunder Supabase project:
 *   profiles          (id, display_name, avatar_url, theme_preference, signup_site, deletion_requested_at, created_at)
 *   site_memberships  (user_id, site, joined_at, last_seen_at)
 *   favorites         (user_id, site, entity_type, entity_id, created_at)
 */

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  theme_preference: 'dark' | 'light';
  signup_site: string | null;
  created_at: string;
}

export interface Membership {
  site: string;
  joined_at: string;
  last_seen_at: string;
}

export interface FavouriteGroup {
  site: string;
  total: number;
  byType: { type: string; count: number }[];
}

export async function getProfile(supabase: SupabaseClient, userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, theme_preference, signup_site, created_at')
    .eq('id', userId)
    .maybeSingle();
  if (error) console.error('profile lookup failed', error.message);
  return (data as Profile | null) ?? null;
}

export async function getMemberships(supabase: SupabaseClient, userId: string): Promise<Membership[]> {
  const { data, error } = await supabase
    .from('site_memberships')
    .select('site, joined_at, last_seen_at')
    .eq('user_id', userId)
    .order('joined_at', { ascending: true });
  if (error) console.error('memberships lookup failed', error.message);
  return (data as Membership[] | null) ?? [];
}

export async function getFavouriteGroups(supabase: SupabaseClient, userId: string): Promise<FavouriteGroup[]> {
  const { data, error } = await supabase.from('favorites').select('site, entity_type').eq('user_id', userId);
  if (error) {
    console.error('favourites lookup failed', error.message);
    return [];
  }
  const bySite = new Map<string, Map<string, number>>();
  for (const row of (data ?? []) as { site: string; entity_type: string }[]) {
    const types = bySite.get(row.site) ?? new Map<string, number>();
    types.set(row.entity_type, (types.get(row.entity_type) ?? 0) + 1);
    bySite.set(row.site, types);
  }
  return Array.from(bySite, ([site, types]) => {
    const byType = Array.from(types, ([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count);
    return { site, total: byType.reduce((sum, t) => sum + t.count, 0), byType };
  });
}

const TYPE_LABELS: Record<string, string> = {
  character: 'Characters',
  comic: 'Comics',
  equipment: 'Equipment',
  location: 'Locations',
  timeline_event: 'Timeline events',
  powerset: 'Powersets',
};

export function entityTypeLabel(type: string): string {
  if (TYPE_LABELS[type]) return TYPE_LABELS[type];
  const text = type.replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/config';

let client: SupabaseClient | null = null;

/** Browser client. Created on first use so builds never need the keys. */
export function getBrowserClient(): SupabaseClient {
  if (!client) {
    client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return client;
}

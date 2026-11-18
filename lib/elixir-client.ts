import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getBrowserClient } from '@/lib/supabase/client';

/**
 * The one place the Elixir area decides which Supabase project it talks to.
 *
 * Today Elixir lives inside the My Sparkthunder project, so this returns the same
 * client as the rest of the site. To move Elixir to its own Supabase project later,
 * set these two environment variables on the host and redeploy. No code changes:
 *
 *   NEXT_PUBLIC_ELIXIR_SUPABASE_URL
 *   NEXT_PUBLIC_ELIXIR_SUPABASE_ANON_KEY
 *
 * See docs/elixir-move-to-own-supabase.md for the full move.
 */
const ELIXIR_URL = process.env.NEXT_PUBLIC_ELIXIR_SUPABASE_URL;
const ELIXIR_ANON = process.env.NEXT_PUBLIC_ELIXIR_SUPABASE_ANON_KEY;

/** True once Elixir has been pointed at its own project. */
export const hasOwnProject = Boolean(ELIXIR_URL && ELIXIR_ANON);

let own: SupabaseClient | null = null;

export function getElixirClient(): SupabaseClient {
  if (!hasOwnProject) return getBrowserClient();
  if (!own) own = createBrowserClient(ELIXIR_URL as string, ELIXIR_ANON as string);
  return own;
}

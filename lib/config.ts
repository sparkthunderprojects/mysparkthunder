/**
 * Settings for the MySparkthunder account backend.
 *
 * The URL and the anon key are PUBLIC values (they are shipped to the
 * browser by design; row level security protects the data). Never put the
 * service role key anywhere in this project.
 *
 * Set them as environment variables (see .env.example). If environment
 * variables can't be used, paste the two values into FALLBACK_URL and
 * FALLBACK_ANON_KEY below instead.
 */
const FALLBACK_URL = '';
const FALLBACK_ANON_KEY = '';

export const SUPABASE_URL = process.env.NEXT_PUBLIC_MYSPARKTHUNDER_SUPABASE_URL || FALLBACK_URL;
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_MYSPARKTHUNDER_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY;

export const SITE_URL = (
  process.env.NEXT_PUBLIC_MYSPARKTHUNDER_SITE_URL || 'https://mysparkthunder.com'
).replace(/\/$/, '');

export const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

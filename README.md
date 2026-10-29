# MySparkthunder

Account home for every Sparkthunder universe. Next.js 14 (App Router, server rendered), Supabase Auth, Tailwind.

## Setup
1. Put the public Supabase Project URL and anon public key into `lib/config.ts` (FALLBACK_URL, FALLBACK_ANON_KEY), or into `.env` as NEXT_PUBLIC_MYSPARKTHUNDER_SUPABASE_URL and NEXT_PUBLIC_MYSPARKTHUNDER_SUPABASE_ANON_KEY.
2. Run the setup SQL in the MySparkthunder Supabase project.
3. `npm install` then `npm run dev`.

Only the public URL and anon key are used. Never add a service_role key to this project.

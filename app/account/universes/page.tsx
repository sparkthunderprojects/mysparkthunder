import type { Metadata } from 'next';
import { ButtonLink, EmptyState, PageHeading } from '@/components/ui';
import { getMemberships } from '@/lib/data';
import { createServerSupabase } from '@/lib/supabase/server';
import { findUniverse, universeName } from '@/lib/universes';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Universes' };

export default async function UniversesJoinedPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const memberships = await getMemberships(supabase, user.id);

  return (
    <div>
      <PageHeading title="Universes" intro="The Sparkthunder universes you have signed in to." />
      {memberships.length === 0 ? (
        <EmptyState
          title="No universes yet"
          action={<ButtonLink href="/universes">See the universes</ButtonLink>}
        >
          Sign in on a Sparkthunder universe with this account and it will appear here.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {memberships.map((m) => {
            const universe = findUniverse(m.site);
            return (
              <li key={m.site} className="flex flex-wrap items-center justify-between gap-4 py-5">
                <div>
                  <h2 className="text-2xl font-semibold" style={universe ? { color: universe.accent } : undefined}>
                    {universeName(m.site)}
                  </h2>
                  <p className="mt-1 text-sm text-dim">
                    Joined {formatDate(m.joined_at)}. Last used {formatDate(m.last_seen_at)}.
                  </p>
                </div>
                {universe?.url && (
                  <ButtonLink href={universe.url} variant="secondary">
                    Visit {universe.name}
                  </ButtonLink>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

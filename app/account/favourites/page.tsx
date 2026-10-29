import type { Metadata } from 'next';
import { ButtonLink, EmptyState, PageHeading } from '@/components/ui';
import { entityTypeLabel, getFavouriteGroups } from '@/lib/data';
import { createServerSupabase } from '@/lib/supabase/server';
import { findUniverse, universeName } from '@/lib/universes';

export const metadata: Metadata = { title: 'Favourites' };

export default async function FavouritesPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const groups = await getFavouriteGroups(supabase, user.id);

  return (
    <div>
      <PageHeading
        title="Favourites"
        intro="What you have saved, kept separately for each universe."
      />
      {groups.length === 0 ? (
        <EmptyState
          title="No favourites yet"
          action={<ButtonLink href="/universes">Explore the universes</ButtonLink>}
        >
          Favourite something in any Sparkthunder universe while you are signed in and it will be listed here.
        </EmptyState>
      ) : (
        <div className="space-y-10">
          {groups.map((group) => {
            const universe = findUniverse(group.site);
            return (
              <section key={group.site} aria-labelledby={`fav-${group.site}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
                  <h2
                    id={`fav-${group.site}`}
                    className="text-3xl font-semibold"
                    style={universe ? { color: universe.accent } : undefined}
                  >
                    {universeName(group.site)}
                  </h2>
                  {universe?.url && (
                    <a href={universe.url} className="text-sm font-semibold text-volt hover:underline">
                      View on {universe.name}
                    </a>
                  )}
                </div>
                <ul className="mt-4 grid gap-x-10 sm:grid-cols-2">
                  {group.byType.map((t) => (
                    <li key={t.type} className="flex items-baseline justify-between border-b border-line/60 py-3">
                      <span>{entityTypeLabel(t.type)}</span>
                      <span className="font-display text-2xl font-extrabold">{t.count}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

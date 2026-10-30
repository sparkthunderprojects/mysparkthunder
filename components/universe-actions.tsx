import Link from 'next/link';
import { ButtonLink } from '@/components/ui';
import type { Universe } from '@/lib/universes';

/**
 * Buttons on every poster. Open universes get a Visit button and a shop
 * button (it switches on when the universe gets a shopUrl). Every universe,
 * open or not, links to its own page on this site.
 */
export default function UniverseActions({ universe }: { universe: Universe }) {
  const live = universe.status === 'live' && universe.url;
  return (
    <div className="mt-5 flex flex-wrap items-center gap-2">
      {live && (
        <ButtonLink href={universe.url as string} className="px-4 py-2.5">
          Visit {universe.name}
        </ButtonLink>
      )}
      {live &&
        (universe.shopUrl ? (
          <ButtonLink href={universe.shopUrl} variant="secondary" className="px-4 py-2.5">
            Shop
          </ButtonLink>
        ) : (
          <span
            aria-disabled="true"
            className="inline-flex cursor-not-allowed items-center rounded border border-bone/15 px-4 py-2.5 text-sm font-bold tracking-wide text-dim"
          >
            Shop opens soon
          </span>
        ))}
      <Link
        href={`/universes/${universe.slug}`}
        className="px-2 py-2.5 text-sm font-semibold text-bone/80 underline-offset-4 hover:text-volt hover:underline"
      >
        {live ? 'More about it' : 'Get notified'}
      </Link>
    </div>
  );
}

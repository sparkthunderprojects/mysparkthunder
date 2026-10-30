import { ButtonLink } from '@/components/ui';
import type { Universe } from '@/lib/universes';

/**
 * The same two buttons on every open universe: go to the universe, or go to
 * its page in the shop. The shop button switches on when the universe gets a
 * shopUrl. Universes still in development show no buttons.
 */
export default function UniverseActions({ universe }: { universe: Universe }) {
  if (universe.status !== 'live' || !universe.url) return null;
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      <ButtonLink href={universe.url} className="px-4 py-2.5">
        Visit {universe.name}
      </ButtonLink>
      {universe.shopUrl ? (
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
      )}
    </div>
  );
}

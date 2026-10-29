export type UniverseStatus = 'live' | 'in-development';

export interface Universe {
  /** Matches the `site` value stored against favourites and memberships. */
  slug: string;
  name: string;
  tagline: string;
  /** Public address, or null while the universe is still being made. */
  url: string | null;
  status: UniverseStatus;
  /** Accent colour used on this universe's poster. */
  accent: string;
  /** Optional wordmark image shown on the poster in place of the plain title. */
  logo?: { src: string; width: number; height: number };
}

/**
 * Every Sparkthunder universe. To add one, add one entry here: it then
 * appears on the home page, the universes page, the sitemap data and the
 * account pages automatically.
 */
export const UNIVERSES: Universe[] = [
  {
    slug: 'knightverge',
    name: 'Knightverge',
    tagline: 'A vampire and slayer mythos, five thousand years deep.',
    url: 'https://knightverge.com',
    status: 'live',
    accent: '#F0B429',
    logo: { src: '/universes/knightverge-logo.png', width: 900, height: 201 },
  },
  {
    slug: 'knightverge-legacy',
    name: 'Knightverge Legacy',
    tagline: 'The tabletop roleplaying game set in the Knightverge world.',
    url: null,
    status: 'in-development',
    accent: '#C9873A',
  },
  {
    slug: 'occult-inc',
    name: 'Occult Inc',
    tagline: 'In development.',
    url: null,
    status: 'in-development',
    accent: '#8B6CF0',
    logo: { src: '/universes/occult-inc-logo.png', width: 900, height: 329 },
  },
  {
    slug: 'grim-gala',
    name: 'Grim Gala',
    tagline: 'In development.',
    url: null,
    status: 'in-development',
    accent: '#D2475F',
  },
];

export function findUniverse(slug: string): Universe | undefined {
  return UNIVERSES.find((u) => u.slug === slug);
}

/** 'occult-inc' -> 'Occult Inc' (for sites not yet listed above). */
export function universeName(slug: string): string {
  const known = findUniverse(slug);
  if (known) return known.name;
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

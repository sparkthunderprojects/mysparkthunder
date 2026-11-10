export type SignInStatus = 'available' | 'coming-soon';

export interface ConnectedSite {
  /** Matches the `site` value used elsewhere (memberships, favourites) where one exists. */
  slug: string;
  name: string;
  /** Public address of the site, or null until it is confirmed. */
  url: string | null;
  /** Short line shown on the card. */
  description: string;
  /** 'available' = the "Sign in with My Sparkthunder" button is live on that site. */
  status: SignInStatus;
  /** Accent colour for the card's frame. */
  accent: string;
  /** Optional wordmark shown in place of the plain name. */
  logo?: { src: string; width: number; height: number };
}

/**
 * Every site where the "Sign in with My Sparkthunder" button is, or is about
 * to be, added. This is the single list behind the /sites page.
 *
 * To open a site up: change its status to 'available' once the button is
 * live on that site. To add a site: add one entry here. The page and the
 * sitemap pick it up automatically.
 */
export const CONNECTED_SITES: ConnectedSite[] = [
  {
    slug: 'knightverge-legacy',
    name: 'Knightverge Legacy',
    url: 'https://knightvergelegacy.com',
    description: 'The tabletop roleplaying game set in the Knightverge world.',
    status: 'available',
    accent: '#C9873A',
    logo: { src: '/universes/knightverge-legacy-logo.png', width: 900, height: 324 },
  },
  {
    slug: 'knightverge',
    name: 'Knightverge',
    url: 'https://knightverge.com',
    description: 'A shared comic universe of heroes, villains and legends.',
    status: 'available',
    accent: '#F0B429',
    logo: { src: '/universes/knightverge-logo.png', width: 900, height: 201 },
  },
  {
    slug: 'roll-combat',
    name: 'Roll Combat',
    url: 'https://rollcombat.com',
    description: 'The home of our tabletop roleplaying games.',
    status: 'coming-soon',
    accent: '#D2475F',
    logo: { src: '/universes/roll-combat-logo.png', width: 801, height: 635 },
  },
  {
    slug: 'sparkthunder-shop',
    name: 'Sparkthunder Shop',
    url: 'https://sparkthunder.shop',
    description: 'The shop for every Sparkthunder universe.',
    status: 'coming-soon',
    accent: '#4FB3D9',
  },
  {
    slug: 'vast-sands-kingdom',
    name: 'Vast Sands Kingdom',
    url: 'https://vastsandskingdom.com',
    description: 'Another world from the Sparkthunder family.',
    status: 'coming-soon',
    accent: '#E0A458',
    logo: { src: '/universes/vast-sands-logo.png', width: 1000, height: 558 },
  },
  {
    slug: 'occult-inc',
    name: 'Occult Inc',
    url: 'https://occultinc.com',
    description: 'An original Sparkthunder universe, in development.',
    status: 'coming-soon',
    accent: '#8B6CF0',
    logo: { src: '/universes/occult-inc-logo.png', width: 900, height: 329 },
  },
];

export function siteHost(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

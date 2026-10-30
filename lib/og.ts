import { UNIVERSES } from '@/lib/universes';

export interface OgCard {
  title: string;
  sub: string;
  accent: string;
}

const DEFAULT: OgCard = { title: 'MySparkthunder', sub: 'One account. Every universe.', accent: '#F0B429' };

/** Share-image text is fixed per key, so the /og route cannot be used to print arbitrary text. */
export const OG_CARDS: Record<string, OgCard> = {
  default: DEFAULT,
  universes: { title: 'The Universes', sub: 'Every Sparkthunder world in one place', accent: '#F0B429' },
  about: { title: 'About Sparkthunder', sub: 'Original worlds. One account.', accent: '#F0B429' },
  news: { title: 'News', sub: 'What is new across Sparkthunder', accent: '#F0B429' },
  press: { title: 'Press kit', sub: 'Logos, facts and contact', accent: '#F0B429' },
  help: { title: 'Help', sub: 'Answers about your account', accent: '#F0B429' },
  ...Object.fromEntries(
    UNIVERSES.map((u) => [u.slug, { title: u.name, sub: u.status === 'live' ? 'Open now' : 'In development', accent: u.accent }]),
  ),
};

export function ogUrl(key: string): string {
  return `/og/${OG_CARDS[key] ? key : 'default'}`;
}

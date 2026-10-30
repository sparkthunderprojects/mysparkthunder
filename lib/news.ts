export interface NewsItem {
  slug: string;
  date: string; // YYYY-MM-DD
  universe: string | null; // universe slug, or null for network news
  title: string;
  summary: string;
}

/**
 * Network news. Add a new entry at the TOP of this list and it appears on the
 * News page and on the home page automatically.
 */
export const NEWS: NewsItem[] = [
  {
    slug: 'mysparkthunder-opens',
    date: '2026-10-30',
    universe: null,
    title: 'MySparkthunder opens',
    summary:
      'One account now works across every Sparkthunder universe. Create it once, and the same email and password sign you in on each site you join.',
  },
  {
    slug: 'knightverge-is-open',
    date: '2026-10-30',
    universe: 'knightverge',
    title: 'Knightverge is open',
    summary:
      'The Knightverge comic universe is live, with characters, powers, equipment, locations and a timeline thousands of years deep.',
  },
  {
    slug: 'occult-inc-in-development',
    date: '2026-10-30',
    universe: 'occult-inc',
    title: 'Occult Inc is in development',
    summary: 'Occult Inc is the next universe in the works. Leave your email on its page to hear first when it opens.',
  },
];

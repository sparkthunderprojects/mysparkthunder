import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/config';
import { UNIVERSES } from '@/lib/universes';

// Public pages only. Account and sign-in pages are private and left out.
const PAGES: { path: string; priority: number; changeFrequency: 'weekly' | 'monthly' | 'yearly' }[] = [
  { path: '', priority: 1, changeFrequency: 'weekly' },
  { path: '/universes', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/news', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/press', priority: 0.4, changeFrequency: 'yearly' },
  ...UNIVERSES.map((u) => ({ path: `/universes/${u.slug}`, priority: 0.8, changeFrequency: 'weekly' as const })),
  { path: '/about', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/help', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PAGES.map((page) => ({
    url: `${SITE_URL}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}

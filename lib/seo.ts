import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/config';
import { COMPANY_NAME, SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';
import type { FaqItem } from '@/lib/faq';
import type { Universe } from '@/lib/universes';

const OG_IMAGE = { url: '/og.png', width: 1200, height: 630, alt: `${SITE_NAME}: one account, every universe` };

interface PageMeta {
  title: string;
  description: string;
  /** Path starting with "/", or "" for the home page. */
  path: string;
  /** Private and utility pages are kept out of search results. */
  noindex?: boolean;
  /** Use the title exactly as given instead of "Title | MySparkthunder". */
  absoluteTitle?: boolean;
}

export function pageMetadata({ title, description, path, noindex, absoluteTitle }: PageMeta): Metadata {
  const url = `${SITE_URL}${path}`;
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      url,
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

export const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: COMPANY_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  description: SITE_DESCRIPTION,
};

export const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  publisher: { '@type': 'Organization', name: COMPANY_NAME, url: SITE_URL },
};

export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: SITE_NAME, path: '' }, ...trail].map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function faqLd(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function universeListLd(universes: Universe[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Sparkthunder universes',
    itemListElement: universes.map((u, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: u.name,
      ...(u.url ? { url: u.url } : {}),
    })),
  };
}

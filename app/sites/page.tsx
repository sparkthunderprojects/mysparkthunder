import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/breadcrumbs';
import JsonLd from '@/components/json-ld';
import { ButtonLink, PageHeading } from '@/components/ui';
import { CONNECTED_SITES, siteHost } from '@/lib/connected-sites';
import { breadcrumbLd, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Sites you can sign in to',
  description:
    'Every site where you can sign in with your MySparkthunder account. Look for the Sign in with My Sparkthunder button on each one.',
  path: '/sites',
});

export default function SitesPage() {
  const trail = [{ name: 'Sites you can sign in to', path: '/sites' }];
  const available = CONNECTED_SITES.filter((s) => s.status === 'available');
  const soon = CONNECTED_SITES.filter((s) => s.status === 'coming-soon');

  const listLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Sites you can sign in to with MySparkthunder',
    itemListElement: CONNECTED_SITES.map((site, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: site.name,
      ...(site.url ? { url: site.url } : {}),
    })),
  };

  return (
    <div className="w-full px-5 py-14 sm:px-8 lg:px-14">
      <JsonLd data={[breadcrumbLd(trail), listLd]} />
      <Breadcrumbs trail={trail} />
      <PageHeading
        title="Sites you can sign in to"
        intro="Your MySparkthunder account works on every site below. On each one, choose Sign in with My Sparkthunder, and you are in."
      />

      {available.length > 0 && (
        <section aria-labelledby="available-heading">
          <h2 id="available-heading" className="mb-5 text-2xl font-semibold">
            Sign in now
          </h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {available.map((site) => (
              <SiteCard key={site.slug} site={site} />
            ))}
          </ul>
        </section>
      )}

      {soon.length > 0 && (
        <section aria-labelledby="soon-heading" className={available.length > 0 ? 'mt-14' : undefined}>
          <h2 id="soon-heading" className="mb-5 text-2xl font-semibold">
            Coming soon
          </h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {soon.map((site) => (
              <SiteCard key={site.slug} site={site} />
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="how-heading" className="mt-16 max-w-3xl">
        <h2 id="how-heading" className="text-2xl font-semibold">
          How it works
        </h2>
        <ul className="mt-4 max-w-prose list-disc space-y-2 pl-5 leading-relaxed text-bone/90">
          <li>
            Open any site above and look for the <strong>Sign in with My Sparkthunder</strong> button on its sign-in
            page.
          </li>
          <li>
            You sign in on mysparkthunder.com, and it tells the site who you are. The site never sees your
            MySparkthunder password.
          </li>
          <li>Google and email sign-in still work on each site. Using My Sparkthunder is always your choice.</li>
          <li>Each site keeps its own data, so what you save on one stays on that one.</li>
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <ButtonLink href="/signup">Create your account</ButtonLink>
          <ButtonLink href="/login" variant="secondary">
            Sign in
          </ButtonLink>
        </div>
        <p className="mt-6 max-w-prose text-sm leading-relaxed text-dim">
          Questions? See <Link href="/help" className="text-volt hover:underline">Help</Link>, or read more about the{' '}
          <Link href="/universes" className="text-volt hover:underline">Sparkthunder universes</Link>.
        </p>
      </section>
    </div>
  );
}

function SiteCard({ site }: { site: (typeof CONNECTED_SITES)[number] }) {
  const live = site.status === 'available';
  return (
    <li className="poster-wrap" style={{ '--accent': site.accent } as CSSProperties}>
      <div className="frame h-full">
        <div className="frame-in flex h-full min-h-[15rem] flex-col justify-between gap-6 bg-panel/60 p-6">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full"
                style={{
                  background: live ? site.accent : 'transparent',
                  border: `1.5px solid ${site.accent}`,
                  boxShadow: live ? `0 0 12px ${site.accent}` : undefined,
                }}
              />
              <span className={live ? 'text-bone' : 'text-dim'}>{live ? 'Sign in available' : 'Coming soon'}</span>
            </p>
            <h3 className="mt-5 flex h-28 items-center">
              {site.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={site.logo.src}
                  alt={site.name}
                  width={site.logo.width}
                  height={site.logo.height}
                  loading="lazy"
                  className="max-h-28 w-auto max-w-full object-contain object-left"
                />
              ) : (
                <span className="text-4xl font-black uppercase leading-[0.9]">{site.name}</span>
              )}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-bone/75">{site.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {live && site.url ? (
              <ButtonLink href={site.url} className="px-4 py-2.5">
                Go to {siteHost(site.url)}
              </ButtonLink>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex cursor-not-allowed items-center rounded border border-bone/15 px-4 py-2.5 text-sm font-bold tracking-wide text-dim"
              >
                Sign-in opens soon
              </span>
            )}
            {!live && site.url && (
              <a
                href={site.url}
                className="text-sm font-semibold text-bone/80 underline-offset-4 hover:text-volt hover:underline"
              >
                Visit {siteHost(site.url)}
              </a>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

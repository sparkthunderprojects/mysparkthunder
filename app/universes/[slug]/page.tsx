import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/breadcrumbs';
import JsonLd from '@/components/json-ld';
import NotifyForm from '@/components/notify-form';
import { ButtonLink } from '@/components/ui';
import { NEWS } from '@/lib/news';
import { breadcrumbLd, pageMetadata } from '@/lib/seo';
import { SITE_URL } from '@/lib/config';
import { UNIVERSES, findUniverse } from '@/lib/universes';
import { formatDate } from '@/lib/utils';

export function generateStaticParams() {
  return UNIVERSES.map((u) => ({ slug: u.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const u = findUniverse(params.slug);
  if (!u) return {};
  const live = u.status === 'live';
  return pageMetadata({
    title: live ? `${u.name}: ${u.tagline}` : `${u.name}: coming soon`,
    description: live
      ? `${u.tagline} Sign in to ${u.name} with your MySparkthunder account.`
      : `${u.name} is a Sparkthunder universe in development. Leave your email to hear first when it opens.`,
    path: `/universes/${u.slug}`,
    og: u.slug,
  });
}

export default function UniversePage({ params }: { params: { slug: string } }) {
  const u = findUniverse(params.slug);
  if (!u) notFound();
  const live = u.status === 'live' && u.url;
  const trail = [
    { name: 'Universes', path: '/universes' },
    { name: u.name, path: `/universes/${u.slug}` },
  ];
  const news = NEWS.filter((n) => n.universe === u.slug);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: u.name,
    url: `${SITE_URL}/universes/${u.slug}`,
    description: u.tagline,
    isPartOf: { '@type': 'WebSite', name: 'MySparkthunder', url: SITE_URL },
  };

  return (
    <div className="w-full px-5 py-14 sm:px-8 lg:px-14">
      <JsonLd data={[breadcrumbLd(trail), ld]} />
      <Breadcrumbs trail={trail} />
      <header className="max-w-3xl">
        {u.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={u.logo.src} alt={u.name} width={u.logo.width} height={u.logo.height} className="h-auto w-full max-w-md" />
        ) : null}
        <h1 className={u.logo ? 'sr-only' : 'text-6xl font-black uppercase leading-[0.9] sm:text-8xl'} style={u.logo ? undefined : { color: u.accent }}>
          {u.name}
        </h1>
        <p className="mt-6 flex items-center gap-2 text-sm font-medium">
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full"
            style={{ background: live ? u.accent : 'transparent', border: `1.5px solid ${u.accent}` }}
          />
          {live ? 'Open now' : 'In development'}
        </p>
        {u.tagline !== 'In development.' && <p className="mt-4 max-w-prose text-xl leading-relaxed text-bone/90">{u.tagline}</p>}
      </header>

      {live ? (
        <section className="mt-10 max-w-prose space-y-4 leading-relaxed text-bone/90">
          <p>
            {u.name} has its own site, its own stories and its own sign-in page. Your MySparkthunder email and password
            work there, and what you save stays in {u.name}.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink href={u.url as string}>Visit {u.name}</ButtonLink>
            <ButtonLink href="/signup" variant="secondary">
              Create your account
            </ButtonLink>
          </div>
        </section>
      ) : (
        <section aria-labelledby="notify-heading" className="mt-10 max-w-xl space-y-4">
          <h2 id="notify-heading" className="text-3xl font-semibold">
            Be first through the door
          </h2>
          <p className="leading-relaxed text-dim">
            {u.name} is still being made. Leave your email and we will write to you once, when it opens.
          </p>
          <NotifyForm topic={u.slug} button="Notify me" done={`You are on the list for ${u.name}.`} />
        </section>
      )}

      {news.length > 0 && (
        <section aria-labelledby="uni-news" className="mt-16 max-w-3xl">
          <h2 id="uni-news" className="text-3xl font-semibold">
            News
          </h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {news.map((n) => (
              <li key={n.slug} className="py-4">
                <p className="text-sm text-dim">{formatDate(n.date)}</p>
                <h3 className="text-xl font-bold">{n.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-dim">{n.summary}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

import Link from 'next/link';
import type { Metadata } from 'next';
import JsonLd from '@/components/json-ld';
import HeroBanners from '@/components/hero-banners';
import AccountIntro from '@/components/account-intro';
import LogoStrip from '@/components/logo-strip';
import NameBand from '@/components/name-band';
import NotifyForm from '@/components/notify-form';
import UniversePoster from '@/components/universe-poster';
import { ButtonLink } from '@/components/ui';
import { FAQ } from '@/lib/faq';
import { NEWS } from '@/lib/news';
import { organizationLd, pageMetadata, websiteLd } from '@/lib/seo';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from '@/lib/site';
import { UNIVERSES, universeName } from '@/lib/universes';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = pageMetadata({
  title: `${SITE_NAME}: ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  path: '',
  absoluteTitle: true,
});

const HOLDS = [
  {
    name: 'Favourites',
    text: 'Save characters, comics and places in each universe and find them again on any device.',
  },
  {
    name: 'Reading history',
    text: 'Pick up where you left off. Your history is kept separately for every universe.',
  },
  {
    name: 'Wish list',
    text: 'Keep track of the Sparkthunder Shop products you want.',
  },
  {
    name: 'Order history',
    text: 'See your Sparkthunder Shop orders together in one place.',
  },
  {
    name: 'One password',
    text: 'The same email and password work on every Sparkthunder site.',
  },
  {
    name: 'Your details',
    text: 'Change your name, email and password once, and it applies everywhere.',
  },
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={[organizationLd, websiteLd]} />

      <HeroBanners />

      <AccountIntro />

      <LogoStrip />

      <section aria-labelledby="universes-heading" className="w-full px-5 sm:px-8 lg:px-14 py-24">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <h2 id="universes-heading" className="text-5xl font-black uppercase leading-none sm:text-7xl">
              The universes
            </h2>
            <p className="mt-4 leading-relaxed text-dim">
              Each universe is its own world with its own site. Your account is the one thing they share.
            </p>
          </div>
          <Link href="/universes" className="font-semibold text-volt hover:text-arc">
            See every universe
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {UNIVERSES.map((universe) => (
            <UniversePoster key={universe.slug} universe={universe} heading="h3" />
          ))}
        </div>
      </section>

      <NameBand />

      <section
        aria-labelledby="holds-heading"
        className="border-y border-line bg-gradient-to-b from-panel to-ink"
      >
        <div className="w-full px-5 sm:px-8 lg:px-14 py-24">
          <h2 id="holds-heading" className="max-w-3xl text-5xl font-black uppercase leading-[0.92] sm:text-7xl">
            What your account holds
          </h2>
          <dl className="mt-14 divide-y divide-line border-y border-line">
            {HOLDS.map((item) => (
              <div
                key={item.name}
                className="group grid gap-2 py-6 transition-colors hover:bg-volt/[0.04] md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:items-baseline md:gap-10 md:px-3"
              >
                <dt className="text-3xl font-extrabold transition-colors group-hover:text-volt sm:text-4xl">
                  {item.name}
                </dt>
                <dd className="max-w-prose leading-relaxed text-dim">{item.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="news-heading" className="w-full px-5 py-24 sm:px-8 lg:px-14">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <h2 id="news-heading" className="text-5xl font-black uppercase leading-none sm:text-7xl">
            What is new
          </h2>
          <Link href="/news" className="font-semibold text-volt hover:text-arc">
            All news
          </Link>
        </div>
        <ul className="grid gap-5 md:grid-cols-3">
          {NEWS.slice(0, 3).map((n) => (
            <li key={n.slug} className="rounded border border-line bg-panel/60 p-6">
              <p className="text-sm text-dim">
                <time dateTime={n.date}>{formatDate(n.date)}</time>
                {n.universe ? `, ${universeName(n.universe)}` : ''}
              </p>
              <h3 className="mt-2 text-2xl font-bold">{n.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-dim">{n.summary}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="shop-heading" className="border-y border-line bg-gradient-to-b from-ink to-panel">
        <div className="grid w-full gap-10 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:px-14">
          <div>
            <h2 id="shop-heading" className="text-5xl font-black uppercase leading-[0.92] sm:text-7xl">
              The Sparkthunder Shop
            </h2>
            <p className="mt-6 max-w-prose leading-relaxed text-dim">
              Official products from every universe are on the way. Leave your email and you will be first to know when
              the doors open. Your orders and wish list will then appear in your MySparkthunder account.
            </p>
          </div>
          <div className="self-center">
            <NotifyForm topic="shop" button="Notify me" done="You are on the list for the Shop." />
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(60%_80%_at_50%_0%,hsl(var(--volt)/0.14),transparent_70%)]"
        />
        <div className="grid gap-14 w-full px-5 sm:px-8 lg:px-14 py-24 lg:grid-cols-2">
          <div>
            <h2 className="text-5xl font-black uppercase leading-[0.92] sm:text-7xl">
              Separate worlds stay separate
            </h2>
            <p className="mt-6 max-w-prose leading-relaxed text-dim">
              Nothing crosses over between universes except you. What you save in one universe stays
              in that universe, and your account page keeps each one in its own section.
            </p>
            <div className="mt-8">
              <ButtonLink href="/signup">Create your account</ButtonLink>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold">Common questions</h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {FAQ.slice(0, 3).map((item) => (
                <li key={item.question} className="py-5">
                  <h3 className="text-xl font-bold">{item.question}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-dim">{item.answer}</p>
                </li>
              ))}
            </ul>
            <p className="mt-5">
              <Link href="/help" className="font-semibold text-volt hover:text-arc">
                Read all the answers
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="letter-heading" className="border-t border-line">
        <div className="w-full px-5 py-20 sm:px-8 lg:px-14">
          <h2 id="letter-heading" className="text-4xl font-black uppercase leading-none sm:text-5xl">
            Stay in the loop
          </h2>
          <p className="mb-6 mt-3 max-w-prose text-dim">News from every universe, sent only when there is something to say.</p>
          <NotifyForm />
        </div>
      </section>
    </>
  );
}

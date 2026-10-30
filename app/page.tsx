import Link from 'next/link';
import type { Metadata } from 'next';
import JsonLd from '@/components/json-ld';
import FeaturedCarousel from '@/components/featured-carousel';
import FeaturedSlide from '@/components/featured-slide';
import HeroBolt from '@/components/hero-bolt';
import NameBand from '@/components/name-band';
import UniversePoster from '@/components/universe-poster';
import { ButtonLink } from '@/components/ui';
import { FAQ } from '@/lib/faq';
import { organizationLd, pageMetadata, websiteLd } from '@/lib/seo';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from '@/lib/site';
import { UNIVERSES } from '@/lib/universes';

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

      <section className="hero-stage -mt-px flex min-h-[calc(100svh-8.5rem)] flex-col justify-end">
        <HeroBolt />
        <div className="hero-flash" aria-hidden="true" />
        <div className="relative z-[4] mx-auto w-full max-w-6xl px-5 pb-14 pt-40 text-center sm:pb-20">
          <h1 className="title-lit text-[clamp(3.6rem,13vw,10.5rem)] font-black uppercase leading-[0.86]">
            <span className="block">One account.</span>
            <span className="block">Every universe.</span>
          </h1>
          <div className="hero-rise">
            <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-bone/80">
              MySparkthunder is the account behind every Sparkthunder universe. Sign in once to save
              your favourites, keep your reading history and manage your details in one place.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/signup">Create your account</ButtonLink>
              <ButtonLink href="/login" variant="secondary">
                Sign in
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="featured-heading" className="mx-auto max-w-6xl px-5 pt-20">
        <h2 id="featured-heading" className="mb-8 text-5xl font-black uppercase leading-none sm:text-7xl">
          Featured
        </h2>
        <FeaturedCarousel count={UNIVERSES.length}>
          {UNIVERSES.map((universe, i) => (
            <FeaturedSlide key={universe.slug} universe={universe} index={i} total={UNIVERSES.length} />
          ))}
        </FeaturedCarousel>
      </section>

      <section aria-labelledby="universes-heading" className="mx-auto max-w-6xl px-5 py-24">
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
        <div className="mx-auto max-w-6xl px-5 py-24">
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

      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(60%_80%_at_50%_0%,hsl(var(--volt)/0.14),transparent_70%)]"
        />
        <div className="mx-auto grid max-w-6xl gap-14 px-5 py-24 lg:grid-cols-2">
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
    </>
  );
}

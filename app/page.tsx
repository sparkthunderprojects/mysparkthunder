import Link from 'next/link';
import type { Metadata } from 'next';
import JsonLd from '@/components/json-ld';
import NetworkBolt from '@/components/network-bolt';
import { BoltMark } from '@/components/logo';
import { ButtonLink } from '@/components/ui';
import { FAQ } from '@/lib/faq';
import { organizationLd, pageMetadata, websiteLd } from '@/lib/seo';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from '@/lib/site';

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

      <section className="relative overflow-hidden border-b border-line">
        <BoltMark
          className="pointer-events-none absolute -right-10 top-1/2 hidden h-[34rem] w-[34rem] -translate-y-1/2 rotate-[8deg] text-volt opacity-[0.07] lg:block"
        />
        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 sm:pt-24">
          <h1 className="text-[clamp(3.5rem,11.5vw,9rem)] font-extrabold leading-[0.9]">
            <span className="block">One account.</span>
            <span className="block">Every universe.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-dim">
            MySparkthunder is the account behind every Sparkthunder universe. Sign in once to save
            your favourites, keep your reading history and manage your details in one place.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/signup">Create your account</ButtonLink>
            <ButtonLink href="/login" variant="secondary">
              Sign in
            </ButtonLink>
          </div>
        </div>
      </section>

      <section aria-labelledby="universes-heading" className="mx-auto max-w-6xl px-5 py-20">
        <div className="mb-14 max-w-xl">
          <h2 id="universes-heading" className="text-4xl font-extrabold sm:text-5xl">
            The universes
          </h2>
          <p className="mt-3 leading-relaxed text-dim">
            Each universe is its own world with its own site. Your account is the one thing they share.
          </p>
        </div>
        <NetworkBolt />
        <p className="mt-12">
          <Link href="/universes" className="font-semibold text-volt hover:underline">
            See every universe
          </Link>
        </p>
      </section>

      <section aria-labelledby="holds-heading" className="border-y border-line bg-panel">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-[1fr_1.6fr]">
          <h2 id="holds-heading" className="max-w-xs text-4xl font-extrabold sm:text-5xl">
            What your account holds
          </h2>
          <dl className="grid gap-x-10 sm:grid-cols-2">
            {HOLDS.map((item) => (
              <div key={item.name} className="border-t border-line py-5">
                <dt className="text-2xl font-semibold">{item.name}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-dim">{item.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-2">
        <div>
          <h2 className="text-4xl font-extrabold sm:text-5xl">Separate worlds stay separate</h2>
          <p className="mt-4 max-w-prose leading-relaxed text-dim">
            Nothing crosses over between universes except you. What you save in one universe stays
            in that universe, and your account page keeps each one in its own section.
          </p>
          <div className="mt-8">
            <ButtonLink href="/signup">Create your account</ButtonLink>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-semibold">Common questions</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {FAQ.slice(0, 3).map((item) => (
              <li key={item.question} className="py-4">
                <h3 className="text-xl font-semibold">{item.question}</h3>
                <p className="mt-1 text-sm leading-relaxed text-dim">{item.answer}</p>
              </li>
            ))}
          </ul>
          <p className="mt-5">
            <Link href="/help" className="font-semibold text-volt hover:underline">
              Read all the answers
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

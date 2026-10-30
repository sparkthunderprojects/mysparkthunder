import type { Metadata } from 'next';
import Breadcrumbs from '@/components/breadcrumbs';
import JsonLd from '@/components/json-ld';
import { PageHeading } from '@/components/ui';
import { CHARACTER_LOGOS } from '@/lib/characters';
import { breadcrumbLd, pageMetadata } from '@/lib/seo';
import { CONTACT_EMAIL } from '@/lib/site';
import { UNIVERSES } from '@/lib/universes';

export const metadata: Metadata = pageMetadata({
  title: 'Press kit',
  description: 'Logos, a short description and contact details for anyone writing about Sparkthunder.',
  path: '/press',
  og: 'press',
});

export default function PressPage() {
  const trail = [{ name: 'Press kit', path: '/press' }];
  const logos = [
    { name: 'Sparkthunder', src: '/sparkthunder-logo.png' },
    ...UNIVERSES.filter((u) => u.logo).map((u) => ({ name: u.name, src: (u.logo as { src: string }).src })),
  ];
  return (
    <div className="w-full px-5 py-14 sm:px-8 lg:px-14">
      <JsonLd data={breadcrumbLd(trail)} />
      <Breadcrumbs trail={trail} />
      <PageHeading title="Press kit" intro="Everything you need to write about Sparkthunder." />

      <section aria-labelledby="press-about" className="max-w-prose space-y-3 leading-relaxed text-bone/90">
        <h2 id="press-about" className="text-3xl font-semibold">
          About Sparkthunder
        </h2>
        <p>
          Sparkthunder is home to a growing set of original universes, each with its own stories, characters and
          website. Knightverge, a shared comic universe, is open now. Other universes are in development. MySparkthunder
          is the single account that works across all of them.
        </p>
      </section>

      <section aria-labelledby="press-logos" className="mt-14">
        <h2 id="press-logos" className="text-3xl font-semibold">
          Logos
        </h2>
        <p className="mt-2 text-sm text-dim">Right-click or long-press to save. Please do not change the colours or proportions.</p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...logos, ...CHARACTER_LOGOS.map((c) => ({ name: c.name, src: c.src }))].map((l) => (
            <li key={l.src} className="flex flex-col justify-between gap-4 rounded border border-line bg-panel/60 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.src} alt={`${l.name} logo`} className="h-24 w-full object-contain" loading="lazy" />
              <a href={l.src} download className="text-sm font-semibold text-volt hover:underline">
                Download {l.name}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="press-contact" className="mt-14 max-w-prose space-y-3 leading-relaxed text-bone/90">
        <h2 id="press-contact" className="text-3xl font-semibold">
          Press contact
        </h2>
        <p>
          For interviews, review copies or anything else, email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-volt hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>
    </div>
  );
}

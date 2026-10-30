import type { Metadata } from 'next';
import Link from 'next/link';
import AboutSky from '@/components/about-sky';
import Breadcrumbs from '@/components/breadcrumbs';
import JsonLd from '@/components/json-ld';
import { breadcrumbLd, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'About MySparkthunder',
  description:
    'Sparkthunder makes original worlds, each with its own site. MySparkthunder is the single account that works across all of them.',
  path: '/about',
});

export default function AboutPage() {
  const trail = [{ name: 'About', path: '/about' }];
  return (
    <>
      <JsonLd data={breadcrumbLd(trail)} />
      <AboutSky />
      <article className="w-full px-5 py-14 sm:px-8 lg:px-14 [&>*]:max-w-3xl">
        <Breadcrumbs trail={trail} />
        <div className="mt-8 max-w-prose space-y-4 leading-relaxed text-bone/90 [&_a]:text-volt [&_a:hover]:underline [&_h2]:mb-1 [&_h2]:mt-10 [&_h2]:text-3xl [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
      <p>
            Sparkthunder is home to a growing set of original universes. Each one is a world of its own, with its
            own story, its own characters and its own site. Knightverge is open now, and others are in
            development.
          </p>
          <h2>One account for the network</h2>
          <p>
            Your MySparkthunder account is the same on every universe. You create it once, and the same email and
            password sign you in on each site you join. You never have to leave the universe you are reading to do
            it, because every site has its own sign-in page.
          </p>
          <h2>Universes stay separate</h2>
          <p>
            Nothing crosses over between universes. What you save in one stays in that universe, and your account
            page keeps each universe in its own section.
          </p>
          <h2>What you can do with it</h2>
          <ul>
            <li>Save favourites in each universe and find them on any device.</li>
            <li>Keep a reading history so you can pick up where you left off.</li>
            <li>Keep a wish list and see your orders from the Sparkthunder Shop.</li>
            <li>Change your name, email and password in one place.</li>
          </ul>
          <p>
            Ready to start? <Link href="/signup">Create your account</Link>, or{' '}
            <Link href="/universes">see the universes</Link> first.
          </p>
        </div>
      </article>
    </>
  );
}

import type { Metadata } from 'next';
import Breadcrumbs from '@/components/breadcrumbs';
import JsonLd from '@/components/json-ld';
import UniversePoster from '@/components/universe-poster';
import { PageHeading } from '@/components/ui';
import { breadcrumbLd, pageMetadata, universeListLd } from '@/lib/seo';
import { UNIVERSES } from '@/lib/universes';

export const metadata: Metadata = pageMetadata({
  title: 'The Sparkthunder universes',
  description:
    'Every Sparkthunder universe in one place. Knightverge is open now, and more worlds are in development. One MySparkthunder account works across all of them.',
  path: '/universes',
});

export default function UniversesPage() {
  const trail = [{ name: 'Universes', path: '/universes' }];
  return (
    <div className="w-full px-5 sm:px-8 lg:px-14 py-14">
      <JsonLd data={[breadcrumbLd(trail), universeListLd(UNIVERSES)]} />
      <Breadcrumbs trail={trail} />
      <PageHeading
        title="The universes"
        intro="Every Sparkthunder universe is its own world with its own site. One MySparkthunder account works across all of them."
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {UNIVERSES.map((universe) => (
          <UniversePoster key={universe.slug} universe={universe} />
        ))}
      </div>
    </div>
  );
}

import Breadcrumbs from '@/components/breadcrumbs';
import JsonLd from '@/components/json-ld';
import { PageHeading } from '@/components/ui';
import { breadcrumbLd } from '@/lib/seo';

/** Shared layout for the plain text pages (about, privacy, terms, contact). */
export default function DocPage({
  title,
  intro,
  path,
  children,
}: {
  title: string;
  intro?: string;
  path: string;
  children: React.ReactNode;
}) {
  const trail = [{ name: title, path }];
  return (
    <article className="mx-auto max-w-3xl px-5 py-14">
      <JsonLd data={breadcrumbLd(trail)} />
      <Breadcrumbs trail={trail} />
      <PageHeading title={title} intro={intro} />
      <div className="max-w-prose space-y-4 leading-relaxed text-bone/90 [&_a]:text-volt [&_a:hover]:underline [&_h2]:mb-1 [&_h2]:mt-10 [&_h2]:text-3xl [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </article>
  );
}

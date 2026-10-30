import type { Metadata } from 'next';
import Breadcrumbs from '@/components/breadcrumbs';
import JsonLd from '@/components/json-ld';
import NotifyForm from '@/components/notify-form';
import { PageHeading } from '@/components/ui';
import { NEWS } from '@/lib/news';
import { breadcrumbLd, pageMetadata } from '@/lib/seo';
import { universeName } from '@/lib/universes';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = pageMetadata({
  title: 'News from every Sparkthunder universe',
  description: 'What is new across Sparkthunder: new universes, releases and updates, all in one place.',
  path: '/news',
  og: 'news',
});

export default function NewsPage() {
  const trail = [{ name: 'News', path: '/news' }];
  return (
    <div className="w-full px-5 py-14 sm:px-8 lg:px-14">
      <JsonLd data={breadcrumbLd(trail)} />
      <Breadcrumbs trail={trail} />
      <PageHeading title="News" intro="What is new across every Sparkthunder universe." />
      <ul className="max-w-3xl divide-y divide-line border-y border-line">
        {NEWS.map((n) => (
          <li key={n.slug} className="py-6">
            <p className="text-sm text-dim">
              <time dateTime={n.date}>{formatDate(n.date)}</time>
              {n.universe ? `, ${universeName(n.universe)}` : ', Sparkthunder'}
            </p>
            <h2 className="mt-1 text-3xl font-semibold">{n.title}</h2>
            <p className="mt-2 max-w-prose leading-relaxed text-dim">{n.summary}</p>
          </li>
        ))}
      </ul>
      <section aria-labelledby="news-sub" className="mt-14 max-w-xl space-y-4">
        <h2 id="news-sub" className="text-3xl font-semibold">
          Get the news by email
        </h2>
        <NotifyForm />
      </section>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/breadcrumbs';
import JsonLd from '@/components/json-ld';
import { PageHeading } from '@/components/ui';
import { FAQ } from '@/lib/faq';
import { breadcrumbLd, faqLd, pageMetadata } from '@/lib/seo';
import { CONTACT_EMAIL } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Help and common questions',
  description:
    'Answers about your MySparkthunder account: signing in, resetting your password, changing your email, your favourites and deleting your account.',
  path: '/help',
});

export default function HelpPage() {
  const trail = [{ name: 'Help', path: '/help' }];
  return (
    <article className="w-full px-5 py-14 sm:px-8 lg:px-14 [&>*]:max-w-3xl">
      <JsonLd data={[breadcrumbLd(trail), faqLd(FAQ)]} />
      <Breadcrumbs trail={trail} />
      <PageHeading
        title="Help and common questions"
        intro="Everything about your MySparkthunder account, answered in one place."
      />
      <div className="divide-y divide-line border-y border-line">
        {FAQ.map((item) => (
          <section key={item.question} className="py-6">
            <h2 className="text-2xl font-semibold">{item.question}</h2>
            <p className="mt-2 max-w-prose leading-relaxed text-dim">{item.answer}</p>
          </section>
        ))}
      </div>
      <p className="mt-10 max-w-prose leading-relaxed text-dim">
        Still stuck? <Link href="/contact" className="text-volt hover:underline">Contact us</Link> at{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-volt hover:underline">
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </article>
  );
}

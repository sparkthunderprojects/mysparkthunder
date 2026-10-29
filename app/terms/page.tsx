import type { Metadata } from 'next';
import Link from 'next/link';
import DocPage from '@/components/doc-page';
import { pageMetadata } from '@/lib/seo';
import { CONTACT_EMAIL } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Terms of use',
  description: 'The rules for using a MySparkthunder account across Sparkthunder universes.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <DocPage
      title="Terms of use"
      path="/terms"
      intro="The rules for using your MySparkthunder account."
    >
      <h2>Your account</h2>
      <p>
        You need a valid email address to create an account. Keep your password private and tell us straight
        away if you think someone else has used your account. You are responsible for what happens under it.
      </p>
      <h2>One account, many universes</h2>
      <p>
        Your MySparkthunder account works on every Sparkthunder universe that offers sign-in. Each universe is
        a separate site and may have its own rules for its own content, which will be shown on that site.
      </p>
      <h2>Using the service</h2>
      <ul>
        <li>Do not try to get into another person&apos;s account.</li>
        <li>Do not misuse the service or try to interfere with how it works.</li>
        <li>Do not use the account to break the law.</li>
      </ul>
      <h2>Ending your account</h2>
      <p>
        You can ask for your account to be deleted at any time from{' '}
        <Link href="/account/security">Security</Link>. We may suspend an account that breaks these terms.
        Deleting an account removes it from every Sparkthunder site.
      </p>
      <h2>Changes</h2>
      <p>
        We may update these terms as the network grows. The current version is always on this page, and
        continuing to use your account means you accept it.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about these terms can be sent to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </DocPage>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import ContactForm from '@/components/contact-form';
import DocPage from '@/components/doc-page';
import { pageMetadata } from '@/lib/seo';
import { CONTACT_EMAIL } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Contact Sparkthunder',
  description: 'How to reach Sparkthunder about your MySparkthunder account.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <DocPage
      title="Contact Sparkthunder"
      path="/contact"
      intro="Questions about your account? Write to us and we will help."
    >
      <p>
        Email{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold">
          {CONTACT_EMAIL}
        </a>
        . Please write from the email address on your account so we can find it, and never send your password.
      </p>
      <ContactForm />
      <p>
        Many questions are answered on the <Link href="/help">help page</Link>, including how to reset a
        password and how to delete your account.
      </p>
    </DocPage>
  );
}

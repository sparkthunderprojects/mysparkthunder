import type { Metadata } from 'next';
import Link from 'next/link';
import DocPage from '@/components/doc-page';
import { pageMetadata } from '@/lib/seo';
import { CONTACT_EMAIL } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy policy',
  description:
    'What information your MySparkthunder account holds, how it is used, and how to ask for it to be deleted.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <DocPage
      title="Privacy policy"
      path="/privacy"
      intro="What your MySparkthunder account holds and how we look after it."
    >
      <h2>Who we are</h2>
      <p>
        MySparkthunder is the account service for Sparkthunder and the universes it runs. Sparkthunder is
        responsible for the information held in your account.
      </p>
      <h2>What we hold</h2>
      <ul>
        <li>Your email address and an encrypted form of your password.</li>
        <li>Your display name, avatar link and theme choice, if you set them.</li>
        <li>Which Sparkthunder universes you have joined and when you last used them.</li>
        <li>Your favourites, reading history and compare lists, kept separately for each universe.</li>
        <li>When the Sparkthunder Shop opens, your wish list and order history.</li>
      </ul>
      <h2>How we use it</h2>
      <p>
        We use this information to sign you in, to show you your own saved items and to help you if you contact
        us. We do not sell it. Each universe only shows you the items that belong to that universe.
      </p>
      <h2>Who can see it</h2>
      <p>
        Only you can see your saved items. Sparkthunder staff can see account details and activity totals when
        they are helping you with a support request.
      </p>
      <h2>Cookies</h2>
      <p>
        We use cookies that keep you signed in. We do not use them to follow you around other websites.
      </p>
      <h2>Your choices</h2>
      <ul>
        <li>You can change your name, email and password at any time under Security in your account.</li>
        <li>
          You can ask us to delete your account from <Link href="/account/security">Security</Link>. Deleting
          your account removes it from every Sparkthunder site.
        </li>
        <li>
          You can ask what we hold about you, or ask us to correct it, by writing to{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </li>
      </ul>
      <h2>Changes</h2>
      <p>If we change this policy, the new version will appear on this page.</p>
    </DocPage>
  );
}

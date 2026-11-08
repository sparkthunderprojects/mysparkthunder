import type { Metadata } from 'next';
import AuthShell from '@/components/auth-shell';
import WelcomeForm from '@/components/welcome-form';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Welcome to Sparkthunder',
  description: 'Create your Sparkthunder ID and join MySparkthunder.',
  path: '/welcome',
  noindex: true,
});

export default function WelcomePage({ searchParams }: { searchParams?: { next?: string } }) {
  return (
    <AuthShell title="Welcome to Sparkthunder" intro="Your worlds. One identity.">
      <WelcomeForm next={searchParams?.next} />
    </AuthShell>
  );
}

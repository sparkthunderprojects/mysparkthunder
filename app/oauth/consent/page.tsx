import type { Metadata } from 'next';
import AuthShell from '@/components/auth-shell';
import ConsentView from '@/components/oauth-consent';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Approve sign-in',
  description: 'Approve a Sparkthunder site to sign you in with your MySparkthunder account.',
  path: '/oauth/consent',
  noindex: true,
});

export default function ConsentPage({ searchParams }: { searchParams?: { authorization_id?: string } }) {
  return (
    <AuthShell
      title="Approve sign-in"
      popupHideHeading
      intro="A Sparkthunder site is asking to sign you in with your MySparkthunder account."
    >
      <ConsentView authorizationId={searchParams?.authorization_id ?? ''} />
    </AuthShell>
  );
}

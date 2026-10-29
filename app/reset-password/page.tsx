import type { Metadata } from 'next';
import AuthShell from '@/components/auth-shell';
import ResetForm from '@/components/reset-form';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Choose a new password',
  description: 'Choose a new password for your MySparkthunder account.',
  path: '/reset-password',
  noindex: true,
});

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Choose a new password">
      <ResetForm />
    </AuthShell>
  );
}

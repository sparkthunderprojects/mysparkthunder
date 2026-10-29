import type { Metadata } from 'next';
import Link from 'next/link';
import AuthShell from '@/components/auth-shell';
import ForgotForm from '@/components/forgot-form';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Forgot password',
  description: 'Get a link to choose a new MySparkthunder password.',
  path: '/forgot-password',
  noindex: true,
});

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot password"
      intro="Enter the email on your account and we will send you a link to choose a new password."
      footer={
        <Link href="/login" className="font-semibold text-volt hover:underline">
          Back to sign in
        </Link>
      }
    >
      <ForgotForm />
    </AuthShell>
  );
}

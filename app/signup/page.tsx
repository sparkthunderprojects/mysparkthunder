import type { Metadata } from 'next';
import Link from 'next/link';
import AuthShell from '@/components/auth-shell';
import SignupForm from '@/components/signup-form';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Create your account',
  description: 'Create your MySparkthunder account. One account works across every Sparkthunder universe.',
  path: '/signup',
  noindex: true,
});

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      intro="One account for every Sparkthunder universe."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-volt hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}

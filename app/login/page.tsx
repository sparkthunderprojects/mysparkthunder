import type { Metadata } from 'next';
import Link from 'next/link';
import AuthShell from '@/components/auth-shell';
import LoginForm from '@/components/login-form';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Sign in',
  description: 'Sign in to your MySparkthunder account.',
  path: '/login',
  noindex: true,
});

export default function LoginPage({ searchParams }: { searchParams?: { next?: string } }) {
  return (
    <AuthShell
      title="Sign in"
      popupTitle="Sign in to continue"
      popupIntro="Use your MySparkthunder account. The site you came from never sees your password."
      intro="Use your MySparkthunder account. It is the same one you use on every Sparkthunder site."
      footer={
        <>
          New here?{' '}
          <Link href="/signup" className="font-semibold text-volt hover:underline">
            Create your account
          </Link>
        </>
      }
    >
      <LoginForm next={searchParams?.next} />
    </AuthShell>
  );
}

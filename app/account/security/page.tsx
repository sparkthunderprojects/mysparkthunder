import type { Metadata } from 'next';
import { ChangeEmailForm, ChangePasswordForm, DeleteRequestForm } from '@/components/security-forms';
import { PageHeading } from '@/components/ui';
import { createServerSupabase } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Security' };

export default async function SecurityPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return (
    <div className="space-y-14">
      <PageHeading
        title="Security"
        intro="Your email and password work on every Sparkthunder site, so changes here apply everywhere."
      />
      <section aria-labelledby="password-heading" className="space-y-4">
        <h2 id="password-heading" className="text-3xl font-semibold">
          Password
        </h2>
        <ChangePasswordForm />
      </section>
      <section aria-labelledby="email-heading" className="space-y-4 border-t border-line pt-10">
        <h2 id="email-heading" className="text-3xl font-semibold">
          Email address
        </h2>
        <ChangeEmailForm currentEmail={user.email ?? ''} />
      </section>
      <section aria-labelledby="delete-heading" className="space-y-4 border-t border-line pt-10">
        <h2 id="delete-heading" className="text-3xl font-semibold">
          Delete your account
        </h2>
        <DeleteRequestForm userId={user.id} />
      </section>
    </div>
  );
}

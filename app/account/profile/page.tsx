import type { Metadata } from 'next';
import ProfileForm from '@/components/profile-form';
import { PageHeading } from '@/components/ui';
import { getProfile } from '@/lib/data';
import { createServerSupabase } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Profile' };

export default async function ProfilePage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const profile = await getProfile(supabase, user.id);

  return (
    <div>
      <PageHeading title="Profile" intro="How you appear across Sparkthunder sites." />
      <ProfileForm
        userId={user.id}
        initial={{
          displayName: profile?.display_name ?? '',
          avatarUrl: profile?.avatar_url ?? '',
          theme: profile?.theme_preference === 'light' ? 'light' : 'dark',
        }}
      />
    </div>
  );
}

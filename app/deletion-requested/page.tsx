import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Deletion requested',
  description: 'Your MySparkthunder account deletion request has been received.',
  path: '/deletion-requested',
  noindex: true,
});

export default function DeletionRequestedPage() {
  return (
    <div className="mx-auto max-w-xl px-5 py-24">
      <h1 className="text-5xl font-extrabold">Deletion requested</h1>
      <p className="mt-4 leading-relaxed text-dim">
        We have received your request and signed you out. Your account will be removed from every Sparkthunder
        site. If you did this by mistake, contact us as soon as you can and we will stop it.
      </p>
      <div className="mt-8 flex gap-3">
        <ButtonLink href="/">Back to the home page</ButtonLink>
        <ButtonLink href="/contact" variant="secondary">
          Contact us
        </ButtonLink>
      </div>
    </div>
  );
}

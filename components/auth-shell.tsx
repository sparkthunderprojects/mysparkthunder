import { NotConfigured } from '@/components/ui';
import { isConfigured } from '@/lib/config';

/** Centred panel used by the sign-in, sign-up and reset pages. */
export default function AuthShell({
  title,
  intro,
  children,
  footer,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-14">
      <h1 className="text-5xl font-extrabold">{title}</h1>
      {intro && <p className="mt-3 leading-relaxed text-dim">{intro}</p>}
      <div className="mt-8">{isConfigured ? children : <NotConfigured />}</div>
      {footer && <div className="mt-8 border-t border-line pt-6 text-sm text-dim">{footer}</div>}
    </div>
  );
}

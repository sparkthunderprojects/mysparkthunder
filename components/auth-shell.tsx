import HeroBolt from '@/components/hero-bolt';
import { NotConfigured } from '@/components/ui';
import { isConfigured } from '@/lib/config';

/** Sign-in, sign-up and reset pages: a lit stage on the left, the form on the right. */
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
    <div className="grid min-h-[calc(100svh-8.5rem)] lg:grid-cols-[1.1fr_1fr]">
      <div className="hero-stage hidden items-end p-12 lg:flex" aria-hidden="true">
        <HeroBolt />
        <div className="hero-flash" />
        <p className="title-lit relative z-[4] text-7xl font-black uppercase leading-[0.88]">
          One account.
          <br />
          Every universe.
        </p>
      </div>
      <div className="relative mx-auto flex w-full max-w-md flex-col justify-center px-5 py-14 lg:max-w-lg lg:px-14">
        <h1 className="text-5xl font-black uppercase leading-[0.92] sm:text-6xl">{title}</h1>
        {intro && <p className="mt-3 leading-relaxed text-dim">{intro}</p>}
        <div className="mt-8">{isConfigured ? children : <NotConfigured />}</div>
        {footer && <div className="mt-8 border-t border-line pt-6 text-sm text-dim">{footer}</div>}
      </div>
    </div>
  );
}

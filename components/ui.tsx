import Link from 'next/link';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

const base =
  'inline-flex items-center justify-center gap-2 rounded px-5 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60';

const variants: Record<Variant, string> = {
  primary: 'bg-volt text-ink hover:bg-arc',
  secondary: 'border border-line text-bone hover:border-volt hover:text-volt',
  danger: 'bg-danger text-ink hover:opacity-90',
  ghost: 'text-dim hover:text-bone',
};

export function buttonClass(variant: Variant = 'primary', className?: string) {
  return cn(base, variants[variant], className);
}

export function ButtonLink({
  href,
  variant = 'primary',
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={buttonClass(variant, className)}>
      {children}
    </Link>
  );
}

export function Button({
  variant = 'primary',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button {...props} className={buttonClass(variant, className)} />;
}

export const inputClass =
  'w-full rounded border border-line bg-raised px-4 py-3 text-sm text-bone placeholder:text-dim focus:border-volt focus:outline-none';

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-bone">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-dim">{hint}</p>}
    </div>
  );
}

export function Notice({
  kind = 'info',
  children,
}: {
  kind?: 'error' | 'ok' | 'info';
  children: React.ReactNode;
}) {
  const styles = {
    error: 'border-danger/50 bg-danger/10 text-bone',
    ok: 'border-ok/50 bg-ok/10 text-bone',
    info: 'border-line bg-raised text-bone',
  };
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className={cn('rounded border px-4 py-3 text-sm', styles[kind])}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="border border-dashed border-line px-6 py-10">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-dim">{children}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function PageHeading({ title, intro }: { title: string; intro?: string }) {
  return (
    <header className="mb-8 max-w-prose">
      <h1 className="text-4xl font-extrabold sm:text-5xl">{title}</h1>
      {intro && <p className="mt-3 leading-relaxed text-dim">{intro}</p>}
    </header>
  );
}

export function NotConfigured() {
  return (
    <Notice kind="info">
      Accounts are not switched on yet. Add the account settings to this site and reload the page.
    </Notice>
  );
}

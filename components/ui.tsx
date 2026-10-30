import Link from 'next/link';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

const base =
  'inline-flex items-center justify-center gap-2 rounded px-6 py-3 text-sm font-bold tracking-wide transition-all disabled:cursor-not-allowed disabled:opacity-60';

const variants: Record<Variant, string> = {
  primary: 'btn-gold text-ink',
  secondary:
    'border border-bone/25 bg-ink/40 text-bone backdrop-blur hover:border-volt hover:text-volt hover:shadow-[0_0_28px_-8px_hsl(var(--volt)/0.7)]',
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
  'w-full rounded border border-line bg-raised/70 px-4 py-3 text-sm text-bone placeholder:text-dim focus:border-volt focus:shadow-[0_0_0_3px_hsl(var(--volt)/0.18)] focus:outline-none';

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
    <div className="frame frame-neutral">
      <div className="frame-in bg-panel/60 px-6 py-10">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-dim">{children}</p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}

export function PageHeading({ title, intro }: { title: string; intro?: string }) {
  return (
    <header className="mb-8 max-w-prose">
      <h1 className="text-5xl font-black uppercase leading-[0.92] sm:text-6xl">{title}</h1>
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

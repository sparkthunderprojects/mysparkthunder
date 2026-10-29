import Link from 'next/link';
import { cn } from '@/lib/utils';

/** The lightning mark. Swap this file's SVG when the final logo arrives. */
export function BoltMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={cn('h-7 w-7', className)}>
      <path d="M37 4 14 36h15l-5 24 26-34H35z" fill="currentColor" />
    </svg>
  );
}

export default function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="MySparkthunder home" className={cn('flex items-center', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/sparkthunder-logo.png"
        alt="Sparkthunder"
        width={960}
        height={Math.round((960 * 459) / 2749)}
        className="h-8 w-auto drop-shadow-[0_0_12px_hsl(var(--volt)/0.25)]"
      />
    </Link>
  );
}

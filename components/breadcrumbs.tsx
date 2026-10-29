import Link from 'next/link';

export default function Breadcrumbs({ trail }: { trail: { name: string; path: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-dim">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/" className="hover:text-bone">
            Home
          </Link>
        </li>
        {trail.map((item, i) => (
          <li key={item.path} className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            {i === trail.length - 1 ? (
              <span aria-current="page" className="text-bone">
                {item.name}
              </span>
            ) : (
              <Link href={item.path} className="hover:text-bone">
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

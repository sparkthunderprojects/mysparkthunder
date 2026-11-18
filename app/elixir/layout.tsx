import type { Metadata } from 'next';
import './elixir.css';
import ElixirHeader from '@/components/elixir/header';

// Staff-only area, kept out of search results.
export const metadata: Metadata = {
  title: 'Elixir Points',
  robots: { index: false, follow: false },
};

export default function ElixirLayout({ children }: { children: React.ReactNode }) {
  return <div className="elixir-admin min-h-screen">
      <ElixirHeader />
      {children}
    </div>;
}

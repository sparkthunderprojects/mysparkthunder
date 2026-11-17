import ElixirSession from '@/components/elixir/session';
import { ElixirDashboard } from '@/components/elixir/ElixirDashboard';
import { NotConfigured } from '@/components/ui';
import { isConfigured } from '@/lib/config';

export default function ElixirPage() {
  if (!isConfigured) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <NotConfigured />
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <ElixirSession>
        <ElixirDashboard />
      </ElixirSession>
    </div>
  );
}

'use client';

import { useState, type ReactNode } from "react";
import { Award, Coins, Crown, Gift, History, KeyRound, LogOut, Settings, TrendingUp, Users, CheckCircle2, Wallet } from "lucide-react";
import { api, useAsync } from "@/lib/elixir";
import { useAuth } from "./session";
import { formatCurrency, formatNumber } from "@/lib/elixir-format";
import { ErrorNote, KpiCard, Loading } from "./ui";
import { AdjustmentsView, MembersView } from "./MembersView";
import { RewardsView } from "./RewardsView";
import { BrandsView, SettingsView } from "./AdminViews";

type View = "overview" | "members" | "rewards" | "adjustments" | "brands" | "settings";

export function ElixirDashboard() {
  const { staff } = useAuth();
  const isAdmin = staff?.role === "admin";
  const [view, setView] = useState<View>("overview");

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">
        One points balance across every Sparkthunder brand. Signed in as {staff?.email}{" "}
        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold capitalize text-violet-700">{staff?.role}</span>
      </p>

      <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
        <Tab id="overview" view={view} set={setView} icon={<TrendingUp className="h-4 w-4" />} label="Overview" />
        <Tab id="members" view={view} set={setView} icon={<Users className="h-4 w-4" />} label="Members" />
        <Tab id="rewards" view={view} set={setView} icon={<Gift className="h-4 w-4" />} label="Rewards" />
        <Tab id="adjustments" view={view} set={setView} icon={<History className="h-4 w-4" />} label="Adjustments" />
        {isAdmin && <Tab id="brands" view={view} set={setView} icon={<KeyRound className="h-4 w-4" />} label="Brands & Keys" />}
        {isAdmin && <Tab id="settings" view={view} set={setView} icon={<Settings className="h-4 w-4" />} label="Settings" />}
      </div>

      {view === "overview" && <Overview />}
      {view === "members" && <MembersView />}
      {view === "rewards" && <RewardsView isAdmin={isAdmin} />}
      {view === "adjustments" && <AdjustmentsView />}
      {view === "brands" && isAdmin && <BrandsView />}
      {view === "settings" && isAdmin && <SettingsView />}
    </div>
  );
}

function Tab({ id, view, set, icon, label }: { id: View; view: View; set: (v: View) => void; icon: ReactNode; label: string }) {
  const active = view === id;
  return (
    <button onClick={() => set(id)}
      className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${active ? "bg-violet-600 text-white shadow-sm shadow-violet-600/20" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"}`}>
      {icon}{label}
    </button>
  );
}

function Overview() {
  const ov = useAsync(() => api.overview(), []);
  const tiers = useAsync(() => api.tiers(), []);

  if (ov.loading && !ov.data) return <Loading />;
  if (ov.error) return <ErrorNote message={ov.error} />;
  const o = ov.data!;
  const countFor = (id: string) => o.tiers.find((t) => t.id === id)?.members ?? 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Members" value={formatNumber(o.members)} icon={<Users className="h-5 w-5" />} accent="bg-gradient-to-br from-blue-500 to-cyan-600" />
        <KpiCard label="Points outstanding" value={formatNumber(o.points_outstanding, { compact: true })}
          sub={`Liability ${formatCurrency(o.liability_gbp, "GBP")}`} icon={<Wallet className="h-5 w-5" />} accent="bg-gradient-to-br from-amber-500 to-orange-600" />
        <KpiCard label="Points issued (all time)" value={formatNumber(o.points_issued, { compact: true })} icon={<Coins className="h-5 w-5" />} accent="bg-gradient-to-br from-violet-500 to-purple-700" />
        <KpiCard label="Points redeemed" value={formatNumber(o.points_redeemed, { compact: true })}
          sub={`Worth ${formatCurrency(o.redeemed_value_gbp, "GBP")} at ${o.redeem_points_per_gbp} pts = £1`} icon={<TrendingUp className="h-5 w-5" />} accent="bg-gradient-to-br from-emerald-500 to-green-600" />
      </div>

      <div>
        <h3 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">Tiers</h3>
        {tiers.error ? <ErrorNote message={tiers.error} /> : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {(tiers.data ?? []).map((t) => (
              <div key={t.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center gap-3 p-4 text-white" style={{ background: t.color }}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20"><Award className="h-5 w-5" /></div>
                  <div>
                    <p className="text-lg font-bold">{t.name}</p>
                    <p className="text-xs text-white/80">{formatNumber(countFor(t.id))} members</p>
                  </div>
                </div>
                <div className="space-y-2 p-4 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Spend threshold</span><span className="font-semibold">{formatCurrency(t.min_spend_gbp, "GBP", { compact: true })}+</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Earn multiplier</span><span className="font-semibold">{t.earn_multiplier}x</span></div>
                  <ul className="space-y-1 pt-1">
                    {t.perks.map((p, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" style={{ color: t.color }} />{p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-200 p-4 dark:border-slate-700"><h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Brands — last 30 days</h3></div>
        <table className="w-full">
          <thead><tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-700/30">
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Brand</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Points earned (net)</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Spend tracked</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {o.brands_30d.map((b) => (
              <tr key={b.slug}>
                <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">{b.name}</td>
                <td className="px-4 py-3 text-right text-sm">{formatNumber(b.points)}</td>
                <td className="px-4 py-3 text-right text-sm">{formatCurrency(b.spend_gbp, "GBP")}</td>
              </tr>
            ))}
            {o.brands_30d.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-400">No active brands yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

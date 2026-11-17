'use client';

import { useState } from "react";
import { Archive, BookOpen, Gift, Percent, Pencil, Plus, Save, Truck } from "lucide-react";
import { api, errMsg, useAsync, type RewardCategory, type RewardInput, type RewardRow, type RewardType } from "@/lib/elixir";
import { formatCurrency, formatNumber } from "@/lib/elixir-format";
import { ErrorNote, Loading, Modal, Spinner, Toggle } from "./ui";

const TYPE_LABELS: Record<RewardType, string> = {
  fixed_discount: "£ off",
  percent_discount: "% off",
  free_shipping: "Free shipping",
  digital_access: "Digital / access",
};

function RewardIcon({ type }: { type: RewardType }) {
  const c = "h-5 w-5";
  if (type === "free_shipping") return <Truck className={c} />;
  if (type === "digital_access") return <BookOpen className={c} />;
  if (type === "fixed_discount" || type === "percent_discount") return <Percent className={c} />;
  return <Gift className={c} />;
}

export function RewardsView({ isAdmin }: { isAdmin: boolean }) {
  const rewards = useAsync(() => api.rewards(), []);
  const cfg = useAsync(() => api.config(), []);
  const [filter, setFilter] = useState<RewardCategory | "all">("all");
  const [editing, setEditing] = useState<RewardRow | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rate = cfg.data?.redeem_points_per_gbp;
  const list = (rewards.data ?? []).filter((r) => filter === "all" || r.category === filter);

  const act = async (fn: () => Promise<unknown>) => {
    setError(null);
    try { await fn(); rewards.reload(); } catch (e) { setError(errMsg(e)); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Rewards catalog</h3>
          <p className="text-sm text-slate-500">
            {rewards.data?.filter((r) => r.active).length ?? 0} active · {rewards.data?.length ?? 0} total
            {rate ? ` · ${rate} points = £1` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
            {(["all", "ecommerce", "media_content"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${filter === f ? "bg-violet-600 text-white" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"}`}>
                {f === "all" ? "All" : f === "ecommerce" ? "E-Commerce" : "Media & Content"}
              </button>
            ))}
          </div>
          {isAdmin && <button onClick={() => setEditing("new")} className="btn-primary bg-violet-600 hover:bg-violet-700"><Plus className="h-4 w-4" />Create reward</button>}
        </div>
      </div>

      <ErrorNote message={error ?? rewards.error} />
      {rewards.loading && !rewards.data ? <Loading /> : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((r) => (
            <div key={r.id} className={`overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 ${r.active ? "" : "opacity-60"}`}>
              <div className="flex items-start justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/20"><RewardIcon type={r.reward_type} /></div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{r.title}</p>
                    <span className="mt-0.5 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">{TYPE_LABELS[r.reward_type]}</span>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <Toggle on={r.active} onChange={(v) => act(() => api.setRewardActive(r.id, v))} />
                    <button onClick={() => setEditing(r)} className="btn-ghost p-1.5" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => { if (confirm(`Archive "${r.title}"? Existing codes stay valid.`)) void act(() => api.archiveReward(r.id)); }} className="btn-ghost p-1.5 text-danger-600" aria-label="Archive"><Archive className="h-4 w-4" /></button>
                  </div>
                )}
              </div>
              <p className="px-4 pb-3 text-sm text-slate-500">{r.description || "No description"}</p>
              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 dark:border-slate-700">
                <div>
                  <p className="text-xs text-slate-400">Point cost</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{formatNumber(r.point_cost)} <span className="text-xs font-normal text-slate-400">pts</span></p>
                  {rate && <p className="text-xs text-slate-400">≈ {formatCurrency(r.point_cost / rate, "GBP")}</p>}
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>{r.brand ?? "Any brand"}</p>
                  <p>{r.redeemed} redeemed{r.stock !== null ? ` · ${r.stock} left` : ""}</p>
                </div>
              </div>
            </div>
          ))}
          {list.length === 0 && <p className="col-span-full py-8 text-center text-sm text-slate-400">No rewards</p>}
        </div>
      )}

      {editing && <RewardModal reward={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); rewards.reload(); }} />}
    </div>
  );
}

function RewardModal({ reward, onClose, onSaved }: { reward: RewardRow | null; onClose: () => void; onSaved: () => void }) {
  const brands = useAsync(() => api.brands(), []);
  const [f, setF] = useState<RewardInput>({
    id: reward?.id,
    title: reward?.title ?? "",
    description: reward?.description ?? "",
    category: reward?.category ?? "ecommerce",
    reward_type: reward?.reward_type ?? "fixed_discount",
    value: reward?.value ?? null,
    point_cost: reward?.point_cost ?? 1000,
    brand_id: reward?.brand_id ?? null,
    active: reward?.active ?? true,
    stock: reward?.stock ?? null,
    per_member_limit: reward?.per_member_limit ?? null,
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const needsValue = f.reward_type === "fixed_discount" || f.reward_type === "percent_discount";
  const numOrNull = (s: string) => (s === "" ? null : Number(s));

  const save = async () => {
    setError(null);
    if (!f.title.trim()) return setError("Title is required.");
    if (!(f.point_cost > 0)) return setError("Point cost must be above zero.");
    if (needsValue && !(f.value && f.value > 0)) return setError("Enter the discount value.");
    setBusy(true);
    try { await api.saveReward({ ...f, value: needsValue ? f.value : null }); onSaved(); }
    catch (e) { setError(errMsg(e)); setBusy(false); }
  };

  return (
    <Modal title={reward ? "Edit reward" : "Create reward"} onClose={onClose}>
      <div className="space-y-4">
        <div><label className="label">Title</label><input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className="input" placeholder="£15 off your order" /></div>
        <div><label className="label">Description</label><textarea rows={2} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className="input resize-none" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Category</label>
            <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as RewardCategory })} className="input">
              <option value="ecommerce">E-Commerce</option><option value="media_content">Media & Content</option>
            </select></div>
          <div><label className="label">Type</label>
            <select value={f.reward_type} onChange={(e) => setF({ ...f, reward_type: e.target.value as RewardType })} className="input">
              {(Object.keys(TYPE_LABELS) as RewardType[]).map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </select></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Point cost</label><input type="number" min={1} step={50} value={f.point_cost} onChange={(e) => setF({ ...f, point_cost: parseInt(e.target.value, 10) || 0 })} className="input" /></div>
          {needsValue && <div><label className="label">{f.reward_type === "fixed_discount" ? "Value (£)" : "Value (%)"}</label><input type="number" min={0} step="any" value={f.value ?? ""} onChange={(e) => setF({ ...f, value: numOrNull(e.target.value) })} className="input" /></div>}
        </div>
        <div><label className="label">Redeemable at</label>
          <select value={f.brand_id ?? ""} onChange={(e) => setF({ ...f, brand_id: e.target.value || null })} className="input">
            <option value="">Any brand</option>
            {(brands.data ?? []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Stock (blank = unlimited)</label><input type="number" min={0} value={f.stock ?? ""} onChange={(e) => setF({ ...f, stock: numOrNull(e.target.value) })} className="input" /></div>
          <div><label className="label">Limit per member</label><input type="number" min={1} value={f.per_member_limit ?? ""} onChange={(e) => setF({ ...f, per_member_limit: numOrNull(e.target.value) })} className="input" /></div>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"><Toggle on={f.active} onChange={(v) => setF({ ...f, active: v })} />Active</label>
        <ErrorNote message={error} />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={save} disabled={busy} className="btn-primary bg-violet-600 hover:bg-violet-700">{busy ? <Spinner className="h-4 w-4 text-white" /> : <Save className="h-4 w-4" />}Save</button>
        </div>
      </div>
    </Modal>
  );
}

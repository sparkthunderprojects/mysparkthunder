'use client';

import { useState } from "react";
import { Check, Copy, KeyRound, Plus, Save, ShieldAlert } from "lucide-react";
import { api, errMsg, useAsync, type BrandRow, type Config, type TierRow } from "@/lib/elixir";
import { SUPABASE_URL } from "@/lib/config";

// Shown to brand developers, so it must follow Elixir if it moves to its own project.
const supabaseUrl = process.env.NEXT_PUBLIC_ELIXIR_SUPABASE_URL || SUPABASE_URL;
import { ErrorNote, Loading, Modal, Spinner, Toast, Toggle } from "./ui";

// ---------------------------------------------------------------------------
// Brands & API keys
// ---------------------------------------------------------------------------

export function BrandsView() {
  const brands = useAsync(() => api.brands(), []);
  const [newBrand, setNewBrand] = useState(false);
  const [issued, setIssued] = useState<{ brand: string; key: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const act = async (fn: () => Promise<unknown>) => {
    setError(null);
    try { await fn(); brands.reload(); } catch (e) { setError(errMsg(e)); }
  };

  const createKey = (b: BrandRow) => act(async () => {
    const label = prompt(`Label for the new ${b.name} key (e.g. "production")`, "production");
    if (label === null) return;
    const r = await api.createKey(b.id, label);
    setIssued({ brand: b.name, key: r.key });
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Brands &amp; API keys</h3>
          <p className="text-sm text-slate-500">Each brand&apos;s server uses its own key to report orders. Keys are shown once and stored hashed.</p>
        </div>
        <button onClick={() => setNewBrand(true)} className="btn-primary bg-violet-600 hover:bg-violet-700"><Plus className="h-4 w-4" />Add brand</button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-700 dark:bg-slate-800">
        <p className="mb-1 font-semibold text-slate-900 dark:text-slate-100">Brand-server endpoint</p>
        <code className="block break-all rounded bg-slate-50 p-2 text-xs dark:bg-slate-900">POST {supabaseUrl}/functions/v1/elixir-api/earn</code>
        <p className="mt-2 text-xs text-slate-500">Header <code>x-elixir-key</code>. Call from server code only. Also: /refund, /check-code, /consume-code.</p>
      </div>

      <ErrorNote message={error ?? brands.error} />
      {brands.loading && !brands.data ? <Loading /> : (
        <div className="space-y-4">
          {(brands.data ?? []).map((b) => (
            <div key={b.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{b.name} <span className="ml-1 text-xs font-normal text-slate-400">{b.slug} · {b.brand_type}</span></p>
                  <p className="text-xs text-slate-500">Earn rate: {b.earn_points_per_gbp ?? "global default"} pts per £1</p>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  {b.active ? "Active" : "Inactive"}
                  <Toggle on={b.active} onChange={(v) => act(() => api.saveBrand({ id: b.id, name: b.name, brand_type: b.brand_type, earn_points_per_gbp: b.earn_points_per_gbp, active: v }))} />
                </label>
              </div>
              <div className="border-t border-slate-100 p-4 dark:border-slate-700">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">API keys</p>
                  <button onClick={() => createKey(b)} className="btn-secondary py-1 text-xs"><KeyRound className="h-3.5 w-3.5" />New key</button>
                </div>
                {b.keys.length === 0 && <p className="text-sm text-slate-400">No keys yet</p>}
                <ul className="space-y-1.5">
                  {b.keys.map((k) => (
                    <li key={k.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-700/40">
                      <span><code className="text-xs">{k.prefix}…</code> <span className="ml-2 text-slate-600 dark:text-slate-300">{k.label}</span>
                        {k.revoked_at && <span className="ml-2 text-xs font-semibold text-danger-600">Revoked</span>}</span>
                      {!k.revoked_at && <button onClick={() => { if (confirm("Revoke this key? Any server using it will stop earning points immediately.")) void act(() => api.revokeKey(k.id)); }} className="text-xs font-medium text-danger-600 hover:underline">Revoke</button>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {newBrand && <BrandModal onClose={() => setNewBrand(false)} onSaved={() => { setNewBrand(false); brands.reload(); }} />}
      {issued && <KeyModal brand={issued.brand} apiKey={issued.key} onClose={() => setIssued(null)} />}
    </div>
  );
}

function BrandModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<"owned" | "partner">("owned");
  const [rate, setRate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setError(null);
    if (!name.trim() || !/^[a-z0-9-]+$/.test(slug)) return setError("Enter a name and a slug using lowercase letters, numbers and dashes.");
    setBusy(true);
    try { await api.saveBrand({ name: name.trim(), slug, brand_type: type, earn_points_per_gbp: rate === "" ? null : Number(rate), active: true }); onSaved(); }
    catch (e) { setError(errMsg(e)); setBusy(false); }
  };

  return (
    <Modal title="Add brand" onClose={onClose}>
      <div className="space-y-4">
        <div><label className="label">Name</label><input value={name} onChange={(e) => { setName(e.target.value); if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")); }} className="input" placeholder="Funky" /></div>
        <div><label className="label">Slug</label><input value={slug} onChange={(e) => setSlug(e.target.value)} className="input" placeholder="funky" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Type</label><select value={type} onChange={(e) => setType(e.target.value as "owned" | "partner")} className="input"><option value="owned">Owned</option><option value="partner">Partner</option></select></div>
          <div><label className="label">Earn rate (blank = default)</label><input type="number" min={0} step="any" value={rate} onChange={(e) => setRate(e.target.value)} className="input" /></div>
        </div>
        <ErrorNote message={error} />
        <div className="flex justify-end gap-2"><button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={save} disabled={busy} className="btn-primary bg-violet-600 hover:bg-violet-700">{busy ? <Spinner className="h-4 w-4 text-white" /> : <Save className="h-4 w-4" />}Add brand</button></div>
      </div>
    </Modal>
  );
}

function KeyModal({ brand, apiKey, onClose }: { brand: string; apiKey: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <Modal title={`New key for ${brand}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start gap-2 rounded-lg bg-warning-50 p-3 text-sm text-warning-700">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Copy this key now. It is stored hashed and can never be shown again. Keep it in server-side environment variables only.</span>
        </div>
        <code className="block break-all rounded-lg bg-slate-100 p-3 text-xs dark:bg-slate-900">{apiKey}</code>
        <div className="flex justify-end gap-2">
          <button onClick={async () => { await navigator.clipboard.writeText(apiKey); setCopied(true); }} className="btn-secondary">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Copied" : "Copy key"}</button>
          <button onClick={onClose} className="btn-primary bg-violet-600 hover:bg-violet-700">Done</button>
        </div>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Settings: programme config + tiers
// ---------------------------------------------------------------------------

export function SettingsView() {
  const cfg = useAsync(() => api.config(), []);
  const tiers = useAsync(() => api.tiers(), []);
  const [toast, setToast] = useState<string | null>(null);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3500); };

  if ((cfg.loading && !cfg.data) || (tiers.loading && !tiers.data)) return <Loading />;
  return (
    <div className="space-y-6">
      <Toast message={toast} />
      <ErrorNote message={cfg.error ?? tiers.error} />
      {cfg.data && <ConfigForm initial={cfg.data} onSaved={() => { flash("Programme settings saved"); cfg.reload(); }} />}
      <div>
        <h3 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">Tiers</h3>
        <p className="mb-3 text-sm text-slate-500">Members move between tiers automatically based on spend across all brands in the rolling window.</p>
        <div className="space-y-3">{(tiers.data ?? []).map((t) => <TierForm key={t.id} tier={t} onSaved={() => { flash(`${t.name} saved`); tiers.reload(); }} />)}</div>
      </div>
    </div>
  );
}

function ConfigForm({ initial, onSaved }: { initial: Config; onSaved: () => void }) {
  const [c, setC] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const num = (k: keyof Config, label: string, hint: string, step: number | "any" = 1) => (
    <div><label className="label">{label}</label>
      <input type="number" min={0} step={step} value={c[k]} onChange={(e) => setC({ ...c, [k]: Number(e.target.value) })} className="input" />
      <p className="mt-1 text-xs text-slate-400">{hint}</p></div>
  );
  const save = async () => {
    setBusy(true); setError(null);
    try { await api.saveConfig(c); onSaved(); } catch (e) { setError(errMsg(e)); }
    setBusy(false);
  };
  return (
    <div className="panel space-y-4 p-5">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Programme settings</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {num("earn_points_per_gbp", "Points earned per £1", "Default rate; a brand can override it.", "any")}
        {num("redeem_points_per_gbp", "Points per £1 when redeeming", "200 = Nectar-style (about 0.5% back at 1 point per £1).")}
        {num("tier_window_months", "Tier window (months)", "Spend counted towards tiers.")}
        {num("code_valid_days", "Reward code validity (days)", "Unused codes expire after this.")}
        {num("agent_adjust_limit", "Agent adjustment limit (points)", "Largest single adjustment an agent may make.")}
      </div>
      <p className="text-xs text-slate-400">Changing the redemption rate affects the £ values shown in the dashboard. Existing reward costs stay as set.</p>
      <ErrorNote message={error} />
      <div className="flex justify-end"><button onClick={save} disabled={busy} className="btn-primary bg-violet-600 hover:bg-violet-700">{busy ? <Spinner className="h-4 w-4 text-white" /> : <Save className="h-4 w-4" />}Save settings</button></div>
    </div>
  );
}

function TierForm({ tier, onSaved }: { tier: TierRow; onSaved: () => void }) {
  const [t, setT] = useState({ ...tier, perksText: tier.perks.join("\n") });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true); setError(null);
    try {
      await api.saveTier({ id: t.id, name: t.name, min_spend_gbp: t.min_spend_gbp, earn_multiplier: t.earn_multiplier, color: t.color,
        perks: t.perksText.split("\n").map((s) => s.trim()).filter(Boolean) });
      onSaved();
    } catch (e) { setError(errMsg(e)); }
    setBusy(false);
  };
  return (
    <div className="panel space-y-3 p-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div><label className="label">Name</label><input value={t.name} onChange={(e) => setT({ ...t, name: e.target.value })} className="input" /></div>
        <div><label className="label">Min spend (£)</label><input type="number" min={0} value={t.min_spend_gbp} onChange={(e) => setT({ ...t, min_spend_gbp: Number(e.target.value) })} className="input" /></div>
        <div><label className="label">Earn multiplier</label><input type="number" min={1} step="0.05" value={t.earn_multiplier} onChange={(e) => setT({ ...t, earn_multiplier: Number(e.target.value) })} className="input" /></div>
        <div><label className="label">Colour</label><input type="color" value={t.color} onChange={(e) => setT({ ...t, color: e.target.value })} className="input h-[42px] p-1" /></div>
      </div>
      <div><label className="label">Perks (one per line)</label><textarea rows={3} value={t.perksText} onChange={(e) => setT({ ...t, perksText: e.target.value })} className="input resize-none" /></div>
      <ErrorNote message={error} />
      <div className="flex justify-end"><button onClick={save} disabled={busy} className="btn-secondary">{busy ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}Save {t.name}</button></div>
    </div>
  );
}

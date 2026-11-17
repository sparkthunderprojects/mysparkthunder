'use client';

import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Plus, ScrollText, Search, UserCircle, X } from "lucide-react";
import { api, errMsg, REASON_LABELS, useAsync, type AdjustmentReason, type MemberRow } from "@/lib/elixir";
import { useAuth } from "./session";
import { formatCurrency, formatNumber, relativeTime } from "@/lib/elixir-format";
import { Drawer, ErrorNote, Loading, Modal, Spinner, TierBadge, Toast, th, thr } from "./ui";

function useDebounced<T>(value: T, ms = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

export function MembersView() {
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(50);
  const [history, setHistory] = useState<MemberRow | null>(null);
  const [adjusting, setAdjusting] = useState<MemberRow | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const q = useDebounced(search);
  const members = useAsync(() => api.members(q, limit), [q, limit]);

  const rows = members.data ?? [];

  return (
    <div className="space-y-4">
      <Toast message={toast} />
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-200 p-4 dark:border-slate-700">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setLimit(50); }} placeholder="Search by name or email…" className="input pl-9" />
          </div>
        </div>
        {members.error && <div className="p-4"><ErrorNote message={members.error} /></div>}
        {members.loading && !members.data ? <Loading /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-700/30">
                <th className={th}>Member</th><th className={th}>Tier</th>
                <th className={thr}>Balance</th><th className={thr}>Lifetime pts</th><th className={thr}>Lifetime spend</th><th className={thr}>Orders</th><th className="px-4 py-3" />
              </tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {rows.map((m) => (
                  <tr key={m.member_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{m.display_name || m.email}</p>
                      {m.display_name && <p className="text-xs text-slate-400">{m.email}</p>}
                      {m.status === "suspended" && <span className="text-xs font-semibold text-danger-600">Suspended</span>}
                    </td>
                    <td className="px-4 py-3"><TierBadge name={m.tier_name} color={m.tier_color} /></td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-slate-900 dark:text-slate-100">{formatNumber(m.balance)}</td>
                    <td className="px-4 py-3 text-right text-sm text-slate-500">{formatNumber(m.lifetime_points)}</td>
                    <td className="px-4 py-3 text-right text-sm text-slate-700 dark:text-slate-200">{formatCurrency(m.lifetime_spend_gbp, "GBP")}</td>
                    <td className="px-4 py-3 text-right text-sm text-slate-500">{m.orders}</td>
                    <td className="space-x-3 px-4 py-3 text-right">
                      <button onClick={() => setHistory(m)} className="text-xs font-medium text-violet-600 hover:underline">History</button>
                      <button onClick={() => setAdjusting(m)} className="text-xs font-medium text-violet-600 hover:underline">Adjust</button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">{q ? `No members match "${q}"` : "No members yet — they appear when a brand reports their first order."}</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        {rows.length >= limit && (
          <div className="border-t border-slate-200 p-3 text-center dark:border-slate-700">
            <button onClick={() => setLimit((l) => l + 50)} className="btn-secondary">Show more</button>
          </div>
        )}
      </div>

      {history && <HistoryModal member={history} onClose={() => setHistory(null)} />}
      {adjusting && (
        <AdjustDrawer member={adjusting} onClose={() => setAdjusting(null)}
          onDone={(msg) => { setAdjusting(null); setToast(msg); members.reload(); setTimeout(() => setToast(null), 4000); }} />
      )}
    </div>
  );
}

function HistoryModal({ member, onClose }: { member: MemberRow; onClose: () => void }) {
  const h = useAsync(() => api.memberHistory(member.member_id), [member.member_id]);
  return (
    <Modal title={member.display_name || member.email} onClose={onClose}>
      <div className="mb-4 grid grid-cols-3 gap-3">
        <Stat label="Balance" value={formatNumber(member.balance)} />
        <Stat label="Lifetime pts" value={formatNumber(member.lifetime_points)} />
        <Stat label="Lifetime spend" value={formatCurrency(member.lifetime_spend_gbp, "GBP")} />
      </div>
      <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Points history</p>
      {h.loading && !h.data ? <Loading /> : <ErrorNote message={h.error} />}
      <div className="space-y-2">
        {(h.data ?? []).map((e) => (
          <div key={e.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-600">
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${e.delta >= 0 ? "bg-success-50" : "bg-blue-50"}`}>
                {e.delta >= 0 ? <ArrowUpRight className="h-4 w-4 text-success-600" /> : <ArrowDownRight className="h-4 w-4 text-blue-600" />}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{e.description ?? e.kind}</p>
                <p className="text-xs text-slate-400">{[e.brand, e.kind, e.staff_email, relativeTime(e.created_at)].filter(Boolean).join(" · ")}</p>
                {e.note && <p className="text-xs text-slate-500">“{e.note}”</p>}
              </div>
            </div>
            <span className={`text-sm font-bold ${e.delta >= 0 ? "text-success-600" : "text-blue-600"}`}>{e.delta > 0 ? "+" : ""}{formatNumber(e.delta)}</span>
          </div>
        ))}
        {h.data?.length === 0 && <p className="py-4 text-center text-sm text-slate-400">No activity yet</p>}
      </div>
    </Modal>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-700/50">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-0.5 text-lg font-bold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Adjustments
// ---------------------------------------------------------------------------

export function AdjustmentsView() {
  const [adjusting, setAdjusting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const log = useAsync(() => api.adjustments(), []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Manual adjustments</h3>
          <p className="text-sm text-slate-500">Award or deduct points for individual members. Every change is permanently logged against your account.</p>
        </div>
        <button onClick={() => setAdjusting(true)} className="btn-primary bg-violet-600 hover:bg-violet-700"><Plus className="h-4 w-4" />New adjustment</button>
      </div>
      <Toast message={toast} />
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-2 border-b border-slate-200 p-4 dark:border-slate-700">
          <ScrollText className="h-5 w-5 text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Audit log</h4>
        </div>
        {log.loading && !log.data ? <Loading /> : <div className="p-4 pb-0"><ErrorNote message={log.error} /></div>}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-700/30">
              <th className={th}>When</th><th className={th}>Member</th><th className={thr}>Points</th><th className={th}>Reason</th><th className={th}>Note</th><th className={th}>Staff</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {(log.data ?? []).map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 text-sm text-slate-500">{relativeTime(a.created_at)}</td>
                  <td className="px-4 py-3"><p className="text-sm font-medium text-slate-900 dark:text-slate-100">{a.member_name || a.member_email}</p>{a.member_name && <p className="text-xs text-slate-400">{a.member_email}</p>}</td>
                  <td className={`px-4 py-3 text-right text-sm font-bold ${a.delta > 0 ? "text-success-600" : "text-danger-600"}`}>{a.delta > 0 ? "+" : ""}{formatNumber(a.delta)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{REASON_LABELS[a.reason] ?? a.reason}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-sm text-slate-500" title={a.note}>{a.note}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{a.staff_email}</td>
                </tr>
              ))}
              {log.data?.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">No adjustments yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {adjusting && (
        <AdjustDrawer onClose={() => setAdjusting(false)}
          onDone={(msg) => { setAdjusting(false); setToast(msg); log.reload(); setTimeout(() => setToast(null), 4000); }} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Adjust drawer (shared by Members and Adjustments)
// ---------------------------------------------------------------------------

function AdjustDrawer({ member: initial, onClose, onDone }: { member?: MemberRow; onClose: () => void; onDone: (message: string) => void }) {
  const { staff } = useAuth();
  const cfg = useAsync(() => api.config(), []);
  const [member, setMember] = useState<MemberRow | null>(initial ?? null);
  const [search, setSearch] = useState("");
  const q = useDebounced(search);
  const results = useAsync(() => (member ? Promise.resolve([] as MemberRow[]) : api.members(q, 8)), [q, member?.member_id]);
  const [direction, setDirection] = useState<"add" | "deduct">("add");
  const [points, setPoints] = useState(0);
  const [reason, setReason] = useState<AdjustmentReason>("cs_escalation");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const limit = staff?.role === "agent" ? cfg.data?.agent_adjust_limit : undefined;

  const submit = async () => {
    setError(null);
    if (!member) return setError("Select a member first.");
    if (!points) return setError("Enter a non-zero points value.");
    if (!note.trim()) return setError("A note is required for the audit log.");
    setBusy(true);
    try {
      const delta = direction === "add" ? points : -points;
      const r = await api.adjust(member.member_id, delta, reason, note.trim());
      onDone(`${delta > 0 ? "+" : ""}${formatNumber(delta)} points for ${member.display_name || member.email}. New balance ${formatNumber(r.balance)}.`);
    } catch (e) {
      setError(errMsg(e));
      setBusy(false);
    }
  };

  return (
    <Drawer title="New point adjustment" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="label">Member</label>
          {member ? (
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-700/50">
              <UserCircle className="h-8 w-8 text-violet-500" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{member.display_name || member.email}</p>
                <p className="text-xs text-slate-400">{member.email} · {formatNumber(member.balance)} pts</p>
              </div>
              {!initial && <button onClick={() => setMember(null)} className="btn-ghost p-1 text-slate-400" aria-label="Change member"><X className="h-4 w-4" /></button>}
            </div>
          ) : (
            <div>
              <div className="relative mb-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email…" className="input pl-9" autoFocus />
              </div>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-600">
                {results.loading && <div className="p-3 text-center"><Spinner className="h-4 w-4" /></div>}
                {(results.data ?? []).map((m) => (
                  <button key={m.member_id} onClick={() => setMember(m)} className="flex w-full items-center justify-between gap-3 border-b border-slate-100 p-2.5 text-left last:border-b-0 hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-700/40">
                    <span className="min-w-0"><span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">{m.display_name || m.email}</span><span className="block truncate text-xs text-slate-400">{m.email}</span></span>
                    <TierBadge name={m.tier_name} color={m.tier_color} />
                  </button>
                ))}
                {!results.loading && results.data?.length === 0 && <p className="py-3 text-center text-sm text-slate-400">No members found</p>}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="label">Adjustment</label>
          <div className="mb-2 flex gap-2">
            <button onClick={() => setDirection("add")} className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium ${direction === "add" ? "border-success-500 bg-success-50 text-success-700" : "border-slate-200 text-slate-500 dark:border-slate-600"}`}><ArrowUpRight className="h-4 w-4" />Award</button>
            <button onClick={() => setDirection("deduct")} className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium ${direction === "deduct" ? "border-danger-500 bg-danger-50 text-danger-700" : "border-slate-200 text-slate-500 dark:border-slate-600"}`}><ArrowDownRight className="h-4 w-4" />Deduct</button>
          </div>
          <input type="number" min={0} value={points || ""} onChange={(e) => setPoints(Math.abs(parseInt(e.target.value, 10) || 0))} placeholder="0" className="input text-lg font-bold" />
          {limit !== undefined && <p className="mt-1 text-xs text-slate-400">Agents can adjust up to {formatNumber(limit)} points at a time.</p>}
          {cfg.data && points > 0 && <p className="mt-1 text-xs text-slate-400">≈ {formatCurrency(points / cfg.data.redeem_points_per_gbp, "GBP")} in rewards value</p>}
        </div>

        <div>
          <label className="label">Reason</label>
          <select value={reason} onChange={(e) => setReason(e.target.value as AdjustmentReason)} className="input">
            {(Object.keys(REASON_LABELS) as AdjustmentReason[]).map((r) => <option key={r} value={r}>{REASON_LABELS[r]}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Note (required for audit)</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Explain why this adjustment is being made…" className="input resize-none" />
        </div>
        <ErrorNote message={error} />
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={submit} disabled={busy} className="btn-primary bg-violet-600 hover:bg-violet-700">
            {busy ? <Spinner className="h-4 w-4 text-white" /> : <CheckCircle2 className="h-4 w-4" />}Submit
          </button>
        </div>
      </div>
    </Drawer>
  );
}

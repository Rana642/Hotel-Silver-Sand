"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Eye, EyeOff, Percent, Tag } from "lucide-react";
import { upsertDeal, deleteDeal, toggleDeal, type DealInput } from "@/app/actions/deal";

export type DealRow = {
  id: string;
  name: string;
  discount_percent: number;
  start_date: string;
  end_date: string;
  room_id: string | null;
  refundable: boolean;
  free_cancel_days: number;
  is_active: boolean;
  priority: number;
};
export type RoomOpt = { id: string; name: string };

const empty: DealInput = {
  name: "",
  discount_percent: 10,
  start_date: "",
  end_date: "",
  room_id: null,
  refundable: true,
  free_cancel_days: 2,
  is_active: true,
  priority: 0,
};

export default function DealsEditor({ deals, rooms }: { deals: DealRow[]; rooms: RoomOpt[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DealInput>(empty);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roomName = (id: string | null) => (id ? rooms.find((r) => r.id === id)?.name ?? "Room" : "All rooms");
  const set = <K extends keyof DealInput>(k: K, v: DealInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  function openNew() {
    setEditingId(null);
    setForm(empty);
    setError(null);
    setShowForm(true);
  }
  function openEdit(d: DealRow) {
    setEditingId(d.id);
    setForm({
      name: d.name,
      discount_percent: Number(d.discount_percent),
      start_date: d.start_date,
      end_date: d.end_date,
      room_id: d.room_id,
      refundable: d.refundable,
      free_cancel_days: d.free_cancel_days,
      is_active: d.is_active,
      priority: d.priority,
    });
    setError(null);
    setShowForm(true);
  }

  function save() {
    setError(null);
    start(async () => {
      const res = await upsertDeal(editingId, form);
      if (!res.ok) { setError(res.error); return; }
      setShowForm(false);
      router.refresh();
    });
  }

  const field = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40";
  const label = "mb-1 block text-xs font-semibold text-navy";

  return (
    <div>
      <div className="flex justify-end">
        <button onClick={openNew} className="flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-navy-dark hover:brightness-95">
          <Plus className="size-4" /> New Deal
        </button>
      </div>

      {/* List */}
      <div className="mt-4 space-y-3">
        {deals.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-slate">
            No deals yet. Create one — e.g. an “Early Bird Deal” 10% off for next month.
          </p>
        ) : (
          deals.map((d) => (
            <div key={d.id} className={`flex flex-wrap items-center gap-3 rounded-lg border bg-white p-4 shadow-card ${d.is_active ? "border-gray-100" : "border-gray-200 opacity-60"}`}>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold"><Tag className="size-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-navy">{d.name} <span className="ml-1 text-sm font-bold text-red-600">{Number(d.discount_percent)}% off</span></p>
                <p className="text-xs text-slate">
                  {d.start_date} → {d.end_date} · {roomName(d.room_id)} · {d.refundable ? `Free cancellation (until ${d.free_cancel_days}d before)` : "Non-refundable"} · priority {d.priority}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => start(async () => { await toggleDeal(d.id, !d.is_active); router.refresh(); })} disabled={pending} className="p-1.5 text-slate hover:bg-cream" aria-label={d.is_active ? "Disable" : "Enable"}>
                  {d.is_active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>
                <button onClick={() => openEdit(d)} className="p-1.5 text-slate hover:bg-cream" aria-label="Edit"><Pencil className="size-4" /></button>
                <button onClick={() => { if (window.confirm("Delete this deal?")) start(async () => { await deleteDeal(d.id); router.refresh(); }); }} disabled={pending} className="p-1.5 text-red-500 hover:bg-red-50" aria-label="Delete"><Trash2 className="size-4" /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 py-8" onMouseDown={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="w-full max-w-lg rounded-lg bg-white shadow-pop">
            <div className="border-b border-gray-100 px-5 py-3">
              <h2 className="font-heading text-lg font-bold text-navy">{editingId ? "Edit Deal" : "New Deal"}</h2>
            </div>
            <div className="space-y-4 p-5">
              <label className="block">
                <span className={label}>Deal name</span>
                <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Early Bird Deal" className={field} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className={label}>Discount %</span>
                  <div className="flex items-center rounded-md border border-gray-300">
                    <input type="number" min={0} max={90} value={form.discount_percent} onChange={(e) => set("discount_percent", Number(e.target.value))} className="w-full px-3 py-2 text-sm focus:outline-none" />
                    <span className="px-2 text-slate"><Percent className="size-4" /></span>
                  </div>
                </label>
                <label className="block">
                  <span className={label}>Priority (higher wins)</span>
                  <input type="number" value={form.priority} onChange={(e) => set("priority", Number(e.target.value))} className={field} />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className={label}>Check-in from</span>
                  <input type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} className={field} />
                </label>
                <label className="block">
                  <span className={label}>Check-in to</span>
                  <input type="date" min={form.start_date} value={form.end_date} onChange={(e) => set("end_date", e.target.value)} className={field} />
                </label>
              </div>
              <label className="block">
                <span className={label}>Applies to</span>
                <select value={form.room_id ?? ""} onChange={(e) => set("room_id", e.target.value || null)} className={field}>
                  <option value="">All rooms</option>
                  {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </label>
              <div className="rounded-md bg-cream/60 p-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-navy">
                  <input type="checkbox" checked={form.refundable} onChange={(e) => set("refundable", e.target.checked)} className="size-4 accent-[#d9a928]" />
                  Free cancellation (uncheck for Non-Refundable)
                </label>
                {form.refundable && (
                  <label className="mt-2 block">
                    <span className="mb-1 block text-xs text-slate">Free cancellation until how many days before check-in?</span>
                    <input type="number" min={0} value={form.free_cancel_days} onChange={(e) => set("free_cancel_days", Number(e.target.value))} className={field} />
                  </label>
                )}
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-navy">
                <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="size-4 accent-[#d9a928]" />
                Active
              </label>
              {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
              <button onClick={() => setShowForm(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-slate hover:bg-cream">Cancel</button>
              <button onClick={save} disabled={pending} className="rounded-md bg-gold px-5 py-2 text-sm font-semibold text-navy-dark hover:brightness-95 disabled:opacity-60">{pending ? "Saving…" : "Save Deal"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Tag } from "lucide-react";
import { createCoupon, updateCoupon, deleteCoupon } from "@/app/actions/coupon";

export type Coupon = {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  value: number;
  min_booking: number;
  max_uses: number | null;
  used_count: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
};

const field = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40";
const lbl = "mb-1 block text-xs font-semibold text-navy";

export default function CouponsManager({ coupons, isAdmin }: { coupons: Coupon[]; isAdmin: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [c, setC] = useState({
    code: "", discount_type: "percent" as "percent" | "fixed", value: "10",
    min_booking: "0", max_uses: "", starts_at: "", ends_at: "", is_active: true,
  });

  function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await createCoupon({
        code: c.code,
        discount_type: c.discount_type,
        value: Number(c.value),
        min_booking: Number(c.min_booking) || 0,
        max_uses: c.max_uses ? Number(c.max_uses) : null,
        starts_at: c.starts_at || null,
        ends_at: c.ends_at || null,
        is_active: c.is_active,
      });
      if (!res.ok) { setError(res.error); return; }
      setC({ ...c, code: "", value: "10", min_booking: "0", max_uses: "", starts_at: "", ends_at: "" });
      router.refresh();
    });
  }

  function toggle(id: string, next: boolean) {
    start(async () => {
      await updateCoupon(id, { is_active: next });
      router.refresh();
    });
  }
  function remove(id: string) {
    if (!window.confirm("Delete this coupon?")) return;
    start(async () => {
      const r = await deleteCoupon(id);
      if (!r.ok) setError(r.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      {/* Create */}
      <form onSubmit={add} className="rounded-lg border border-gray-100 bg-white p-5 shadow-card">
        <p className="flex items-center gap-2 font-heading font-bold text-navy"><Tag className="size-4" /> New Coupon</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block"><span className={lbl}>Code</span>
            <input value={c.code} onChange={(e) => setC({ ...c, code: e.target.value })} placeholder="SUMMER25" className={field + " uppercase"} required />
          </label>
          <label className="block"><span className={lbl}>Type</span>
            <select value={c.discount_type} onChange={(e) => setC({ ...c, discount_type: e.target.value as "percent" | "fixed" })} className={field}>
              <option value="percent">Percent (%)</option>
              <option value="fixed">Fixed (PKR)</option>
            </select>
          </label>
          <label className="block"><span className={lbl}>{c.discount_type === "percent" ? "Value (%)" : "Value (PKR)"}</span>
            <input type="number" min={0} value={c.value} onChange={(e) => setC({ ...c, value: e.target.value })} className={field} required />
          </label>
          <label className="block"><span className={lbl}>Min booking (PKR)</span>
            <input type="number" min={0} value={c.min_booking} onChange={(e) => setC({ ...c, min_booking: e.target.value })} className={field} />
          </label>
          <label className="block"><span className={lbl}>Max uses (blank = ∞)</span>
            <input type="number" min={1} value={c.max_uses} onChange={(e) => setC({ ...c, max_uses: e.target.value })} className={field} />
          </label>
          <label className="block"><span className={lbl}>Starts</span>
            <input type="date" value={c.starts_at} onChange={(e) => setC({ ...c, starts_at: e.target.value })} className={field} />
          </label>
          <label className="block"><span className={lbl}>Ends</span>
            <input type="date" value={c.ends_at} onChange={(e) => setC({ ...c, ends_at: e.target.value })} className={field} />
          </label>
          <label className="flex items-end gap-2 pb-2 text-sm text-slate">
            <input type="checkbox" checked={c.is_active} onChange={(e) => setC({ ...c, is_active: e.target.checked })} className="size-4 accent-[#d9a928]" /> Active
          </label>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={pending} className="mt-4 flex items-center gap-2 rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-navy-dark hover:brightness-95 disabled:opacity-60">
          <Plus className="size-4" /> Create Coupon
        </button>
      </form>

      {/* List */}
      {coupons.length === 0 ? (
        <p className="rounded-lg border border-gray-100 bg-white p-6 text-center text-slate shadow-card">No coupons yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-100 bg-white shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 text-xs uppercase text-slate">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Min</th>
                <th className="px-4 py-3">Used</th>
                <th className="px-4 py-3">Validity</th>
                <th className="px-4 py-3">Active</th>
                {isAdmin && <th className="px-4 py-3"></th>}
              </tr>
            </thead>
            <tbody>
              {coupons.map((cp) => (
                <tr key={cp.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3 font-mono font-semibold text-navy">{cp.code}</td>
                  <td className="px-4 py-3 text-navy">{cp.discount_type === "percent" ? `${cp.value}%` : `PKR ${cp.value}`}</td>
                  <td className="px-4 py-3 text-slate">{cp.min_booking ? `PKR ${cp.min_booking}` : "—"}</td>
                  <td className="px-4 py-3 text-slate">{cp.used_count}{cp.max_uses ? ` / ${cp.max_uses}` : ""}</td>
                  <td className="px-4 py-3 text-slate">{cp.starts_at || "—"} → {cp.ends_at || "∞"}</td>
                  <td className="px-4 py-3">
                    <button
                      disabled={pending}
                      onClick={() => toggle(cp.id, !cp.is_active)}
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cp.is_active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}
                    >
                      {cp.is_active ? "Active" : "Off"}
                    </button>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <button disabled={pending} onClick={() => remove(cp.id)} aria-label="Delete" className="rounded-md border border-red-200 p-1.5 text-red-600 hover:bg-red-600 hover:text-white">
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, CalendarPlus, StickyNote } from "lucide-react";
import { setBookingStatus, saveBookingNotes, extendStay, deleteBooking } from "@/app/actions/admin";
import { statusMeta, type BookingStatus } from "@/types";

const order: BookingStatus[] = [
  "pending",
  "confirmed",
  "checked_in",
  "completed",
  "cancelled",
  "no_show",
  "unreachable",
];

export default function BookingActions({
  id,
  current,
  checkOut,
  notes,
}: {
  id: string;
  current: BookingStatus;
  checkOut: string;
  notes: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<BookingStatus>(current);
  const [note, setNote] = useState(notes ?? "");
  const [newCheckout, setNewCheckout] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<{ ok: true } | { ok: false; error: string }>, ok?: () => void) {
    setError(null);
    setMsg(null);
    start(async () => {
      const res = await fn();
      if (!res.ok) {
        setError(res.error);
        return;
      }
      ok?.();
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-card">
        <p className="text-sm font-semibold text-navy">Update Status</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {order.map((s) => (
            <button
              key={s}
              disabled={pending}
              onClick={() => run(() => setBookingStatus(id, s), () => setStatus(s))}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
                status === s ? statusMeta[s].cls + " ring-2 ring-navy/30" : "bg-gray-100 text-slate hover:bg-gray-200"
              }`}
            >
              {statusMeta[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Extend stay */}
      <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-card">
        <p className="flex items-center gap-2 text-sm font-semibold text-navy">
          <CalendarPlus className="size-4" /> Extend Stay
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <input
            type="date"
            min={checkOut}
            value={newCheckout}
            onChange={(e) => setNewCheckout(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
          <button
            disabled={pending || !newCheckout}
            onClick={() => run(() => extendStay(id, newCheckout), () => setNewCheckout(""))}
            className="rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-dark disabled:opacity-50"
          >
            Extend
          </button>
        </div>
        <p className="mt-2 text-xs text-slate">New check-out date. Total recalculates automatically.</p>
      </div>

      {/* Notes */}
      <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-card">
        <p className="flex items-center gap-2 text-sm font-semibold text-navy">
          <StickyNote className="size-4" /> Internal Notes
        </p>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Staff notes (not shown to guest)…"
          className="mt-3 w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
        />
        <button
          disabled={pending}
          onClick={() => run(() => saveBookingNotes(id, note), () => setMsg("Notes saved ✓"))}
          className="mt-3 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-navy-dark hover:brightness-95 disabled:opacity-50"
        >
          Save Notes
        </button>
      </div>

      {msg && <p className="text-sm text-green-600">{msg}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Danger */}
      <div className="rounded-lg border border-red-200 bg-red-50 p-5">
        <p className="text-sm font-semibold text-red-700">Danger Zone</p>
        <p className="mt-1 text-sm text-red-600">Deleting removes the booking and frees its dates.</p>
        <button
          disabled={pending}
          onClick={() => {
            if (!window.confirm("Delete this booking permanently?")) return;
            run(() => deleteBooking(id), () => router.push("/admin/bookings"));
          }}
          className="mt-3 flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          <Trash2 className="size-4" /> Delete Booking
        </button>
      </div>
    </div>
  );
}

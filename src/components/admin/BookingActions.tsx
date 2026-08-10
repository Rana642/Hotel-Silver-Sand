"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { statusMeta, type BookingStatus } from "@/types";

const order: BookingStatus[] = ["pending", "confirmed", "checked_in", "completed", "cancelled"];

export default function BookingActions({
  id,
  current,
}: {
  id: string;
  current: BookingStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<BookingStatus>(current);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(next: BookingStatus) {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("bookings").update({ status: next }).eq("id", id);
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    // Free up the room when cancelled.
    if (next === "cancelled") {
      await supabase.from("availability_blocks").delete().eq("booking_id", id);
    }
    setStatus(next);
    setBusy(false);
    router.refresh();
  }

  async function remove() {
    if (!window.confirm("Delete this booking permanently? This cannot be undone.")) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    // Remove blocks first (FK is SET NULL, not CASCADE) so dates are freed.
    await supabase.from("availability_blocks").delete().eq("booking_id", id);
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    router.push("/admin/bookings");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-card">
        <p className="text-sm font-semibold text-navy">Update Status</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {order.map((s) => (
            <button
              key={s}
              disabled={busy}
              onClick={() => updateStatus(s)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
                status === s ? statusMeta[s].cls + " ring-2 ring-navy/30" : "bg-gray-100 text-slate hover:bg-gray-200"
              }`}
            >
              {statusMeta[s].label}
            </button>
          ))}
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      <div className="rounded-lg border border-red-200 bg-red-50 p-5">
        <p className="text-sm font-semibold text-red-700">Danger Zone</p>
        <p className="mt-1 text-sm text-red-600">Deleting removes the booking and frees its dates.</p>
        <button
          onClick={remove}
          disabled={busy}
          className="mt-3 flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          <Trash2 className="size-4" /> Delete Booking
        </button>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/app/actions/activity";
import type { RoomRow } from "@/types";

type Block = { date: string; reason: string; booking_id: string | null };

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}
function eachDate(start: string, end: string) {
  const out: string[] = [];
  const d = new Date(start + "T00:00:00");
  const last = new Date(end + "T00:00:00");
  while (d <= last) {
    out.push(ymd(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export default function CalendarView({
  rooms,
  blocks,
}: {
  rooms: RoomRow[];
  blocks: Record<string, Block[]>;
}) {
  const router = useRouter();
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? "");
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reason, setReason] = useState<"maintenance" | "walkin">("maintenance");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const today = ymd(new Date());

  const blockMap = useMemo(() => {
    const map = new Map<string, Block>();
    (blocks[roomId] ?? []).forEach((b) => map.set(b.date, b));
    return map;
  }, [blocks, roomId]);

  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const arr: (string | null)[] = [];
    for (let i = 0; i < startPad; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(ymd(new Date(year, month, d)));
    return arr;
  }, [cursor]);

  async function blockRange() {
    if (!from || !to || to < from) {
      setMsg("Pick a valid date range.");
      return;
    }
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const dates = eachDate(from, to);
    const { error, count } = await supabase.from("availability_blocks").upsert(
      dates.map((date) => ({ room_id: roomId, date, reason })),
      { onConflict: "room_id,date", ignoreDuplicates: true, count: "exact" }
    );
    setBusy(false);
    if (error) {
      setMsg("Error: " + error.message);
      return;
    }
    const blocked = count ?? 0;
    setMsg(`Blocked ${blocked} — ${dates.length - blocked} already taken/skipped.`);
    void logActivity("availability.block", "availability", roomId, `${from} → ${to} (${reason})`);
    setFrom("");
    setTo("");
    router.refresh();
  }

  async function unblock(date: string) {
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("availability_blocks")
      .delete()
      .eq("room_id", roomId)
      .eq("date", date)
      .neq("reason", "booking");
    setBusy(false);
    if (error) {
      setMsg("Error: " + error.message);
      return;
    }
    void logActivity("availability.unblock", "availability", roomId, date);
    router.refresh();
  }

  const monthLabel = cursor.toLocaleString("en-US", { month: "long", year: "numeric" });

  return (
    <div>
      {/* Room tabs */}
      <div className="flex flex-wrap gap-2">
        {rooms.map((r) => (
          <button
            key={r.id}
            onClick={() => setRoomId(r.id)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              roomId === r.id ? "border-navy bg-navy text-white" : "border-gray-200 bg-white text-navy"
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Calendar */}
        <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} aria-label="Previous month" className="rounded-md p-1.5 hover:bg-gray-100">
              <ChevronLeft className="size-5 text-navy" />
            </button>
            <p className="font-heading font-bold text-navy">{monthLabel}</p>
            <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} aria-label="Next month" className="rounded-md p-1.5 hover:bg-gray-100">
              <ChevronRight className="size-5 text-navy" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((date, i) => {
              if (!date) return <div key={i} />;
              const block = blockMap.get(date);
              const isBooking = block?.reason === "booking";
              const isManual = block && !isBooking;
              const isPast = date < today;
              const day = Number(date.slice(-2));
              return (
                <div
                  key={date}
                  className={`relative flex aspect-square items-center justify-center rounded-md text-sm ${
                    isBooking
                      ? "bg-red-100 text-red-700"
                      : isManual
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-50 text-navy"
                  } ${isPast ? "opacity-40" : ""}`}
                >
                  {day}
                  {isManual && !isPast && (
                    <button
                      onClick={() => unblock(date)}
                      disabled={busy}
                      aria-label={`Unblock ${date}`}
                      className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-amber-600 text-[10px] text-white"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate">
            <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-red-100" /> Booking</span>
            <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-amber-100" /> Blocked</span>
            <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-gray-50 ring-1 ring-gray-200" /> Available</span>
          </div>
        </div>

        {/* Block form */}
        <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-card">
          <p className="font-heading font-bold text-navy">Block Dates</p>
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-navy">From</span>
              <input type="date" min={today} value={from} onChange={(e) => setFrom(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-navy">To</span>
              <input type="date" min={from || today} value={to} onChange={(e) => setTo(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-navy">Reason</span>
              <select value={reason} onChange={(e) => setReason(e.target.value as "maintenance" | "walkin")} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40">
                <option value="maintenance">Maintenance</option>
                <option value="walkin">Walk-in / phone</option>
              </select>
            </label>
            <button onClick={blockRange} disabled={busy} className="w-full rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-dark disabled:opacity-60">
              {busy ? "Working…" : "Block dates"}
            </button>
            {msg && <p className="text-sm text-slate">{msg}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

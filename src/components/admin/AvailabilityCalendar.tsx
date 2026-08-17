"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Minus, Plus, Pencil, Check, X } from "lucide-react";
import type { RoomAvailability } from "@/lib/availability";
import {
  adjustHold,
  setDateTotalOverride,
  setRoomTotalUnits,
  bulkAddHolds,
  bulkReleaseHolds,
} from "@/app/actions/availability";

function fmtRange(start: string, end: string) {
  const s = new Date(start + "T00:00:00Z");
  const e = new Date(end + "T00:00:00Z");
  const mon = (d: Date) => d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const sameYear = s.getUTCFullYear() === e.getUTCFullYear();
  return `${s.getUTCDate()} ${mon(s)}${sameYear ? "" : " " + s.getUTCFullYear()} — ${e.getUTCDate()} ${mon(e)} ${e.getUTCFullYear()}`;
}

function availClasses(available: number, total: number) {
  if (total === 0) return "bg-gray-100 text-gray-400";
  if (available <= 0) return "bg-red-100 text-red-700";
  if (available === 1) return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

export default function AvailabilityCalendar({
  rooms,
  start,
  end,
  today,
}: {
  rooms: RoomAvailability[];
  start: string;
  end: string; // inclusive last date shown
  today: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editCell, setEditCell] = useState<string | null>(null); // `${roomId}|${date}` override editing
  const [editRoom, setEditRoom] = useState<string | null>(null); // room total-units editing
  const [draft, setDraft] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const dates = rooms[0]?.days.map((d) => d.date) ?? [];

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setMsg(null);
    startTransition(async () => {
      const r = await fn();
      if (!r.ok && r.error) setMsg(r.error);
      setEditCell(null);
      setEditRoom(null);
      router.refresh();
    });
  }

  const prev = `?start=${addDaysStr(start, -14)}`;
  const next = `?start=${addDaysStr(start, 14)}`;

  return (
    <div className="space-y-6">
      {/* Nav bar */}
      <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-card">
        <Link href={prev} aria-label="Previous 2 weeks" className="rounded-md p-1.5 hover:bg-gray-100">
          <ChevronLeft className="size-5 text-navy" />
        </Link>
        <div className="text-center">
          <p className="font-heading text-lg font-bold text-navy">{fmtRange(start, end)}</p>
          {start !== today && (
            <Link href={`?start=${today}`} className="text-[11px] font-semibold uppercase tracking-wide text-gold hover:underline">
              Jump to today
            </Link>
          )}
        </div>
        <Link href={next} aria-label="Next 2 weeks" className="rounded-md p-1.5 hover:bg-gray-100">
          <ChevronRight className="size-5 text-navy" />
        </Link>
      </div>

      {msg && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{msg}</p>}

      {/* Grid */}
      <div className="overflow-x-auto rounded-lg border border-gray-100 bg-white shadow-card">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 min-w-[190px] bg-white px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate">
                Room / Date
              </th>
              {dates.map((d) => {
                const dt = new Date(d + "T00:00:00Z");
                const isToday = d === today;
                const weekend = dt.getUTCDay() === 0 || dt.getUTCDay() === 6;
                return (
                  <th
                    key={d}
                    className={`min-w-[62px] px-1 py-2 text-center ${isToday ? "bg-gold/15" : weekend ? "bg-cream/60" : ""}`}
                  >
                    <div className="text-[10px] font-semibold uppercase text-slate">
                      {dt.toLocaleString("en-US", { weekday: "short", timeZone: "UTC" })}
                    </div>
                    <div className={`text-base font-bold ${isToday ? "text-gold" : "text-navy"}`}>{dt.getUTCDate()}</div>
                    <div className="text-[9px] uppercase text-slate">
                      {dt.toLocaleString("en-US", { month: "short", timeZone: "UTC" })}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <RoomBlock
                key={room.id}
                room={room}
                today={today}
                pending={pending}
                editCell={editCell}
                editRoom={editRoom}
                draft={draft}
                setDraft={setDraft}
                setEditCell={setEditCell}
                setEditRoom={setEditRoom}
                run={run}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate">
        <Legend cls="bg-emerald-100" label="Free rooms" />
        <Legend cls="bg-amber-100" label="1 left" />
        <Legend cls="bg-red-100" label="Sold out" />
        <Legend cls="bg-blue-50 ring-1 ring-blue-200" label="Bookings (auto)" />
        <Legend cls="bg-orange-100 ring-1 ring-orange-300" label="Date-specific override" />
      </div>
      <p className="-mt-3 text-xs text-slate">
        Tip: click a number in the <b>Total units</b> row to override the cap for just that date. Use the +/− on the{" "}
        <b>Manual / OTA</b> row for quick single-day holds. Bookings come from the system automatically.
      </p>

      {/* Bulk forms */}
      <BulkForm
        title="Add manual holds (bulk)"
        hint="Reflect Booking.com / other OTA reservations, walk-in holds, or maintenance across multiple days. Adds N holds per day, capped at the room's inventory."
        cta="Add holds"
        rooms={rooms}
        defaultFrom={today}
        pending={pending}
        onSubmit={(roomId, from, to, units) => run(() => bulkAddHolds(roomId, from, to, units))}
      />
      <BulkForm
        title="Release manual holds (bulk)"
        hint="Undo a mass hold across multiple days — e.g. an OTA block that lifted. Releases up to N manual holds per day; real bookings are never touched."
        cta="Release holds"
        variant="outline"
        rooms={rooms}
        defaultFrom={today}
        pending={pending}
        onSubmit={(roomId, from, to, units) => run(() => bulkReleaseHolds(roomId, from, to, units))}
      />
    </div>
  );
}

function RoomBlock({
  room,
  today,
  pending,
  editCell,
  editRoom,
  draft,
  setDraft,
  setEditCell,
  setEditRoom,
  run,
}: {
  room: RoomAvailability;
  today: string;
  pending: boolean;
  editCell: string | null;
  editRoom: string | null;
  draft: string;
  setDraft: (v: string) => void;
  setEditCell: (v: string | null) => void;
  setEditRoom: (v: string | null) => void;
  run: (fn: () => Promise<{ ok: boolean; error?: string }>) => void;
}) {
  const cols = room.days.length + 1;
  return (
    <>
      {/* Room header row */}
      <tr className="bg-cream/70">
        <td colSpan={cols} className="sticky left-0 px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-navy">{room.name}</span>
            {editRoom === room.id ? (
              <span className="flex items-center gap-1">
                <input
                  autoFocus
                  type="number"
                  min={0}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="w-16 rounded border border-gold px-1.5 py-0.5 text-sm focus:outline-none"
                />
                <button
                  disabled={pending}
                  onClick={() => run(() => setRoomTotalUnits(room.id, Number(draft)))}
                  className="rounded bg-gold p-1 text-navy-dark"
                  aria-label="Save units"
                >
                  <Check className="size-3.5" />
                </button>
                <button onClick={() => setEditRoom(null)} className="rounded bg-gray-200 p-1 text-slate" aria-label="Cancel">
                  <X className="size-3.5" />
                </button>
              </span>
            ) : (
              <button
                onClick={() => {
                  setDraft(String(room.total_units));
                  setEditRoom(room.id);
                }}
                className="flex items-center gap-1 text-xs text-slate hover:text-gold"
              >
                × {room.total_units} units total <Pencil className="size-3" />
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* Total units (editable per date → override) */}
      <tr className="border-b border-gray-50">
        <td className="sticky left-0 z-10 bg-white px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate">
          Total units
        </td>
        {room.days.map((d) => {
          const key = `${room.id}|${d.date}`;
          const editing = editCell === key;
          return (
            <td key={d.date} className="px-1 py-1.5 text-center align-middle">
              {editing ? (
                <div className="flex items-center justify-center gap-0.5">
                  <input
                    autoFocus
                    type="number"
                    min={0}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") run(() => setDateTotalOverride(room.id, d.date, Number(draft)));
                      if (e.key === "Escape") setEditCell(null);
                    }}
                    className="w-10 rounded border border-gold px-1 py-0.5 text-center text-xs focus:outline-none"
                  />
                  <button
                    disabled={pending}
                    onClick={() => run(() => setDateTotalOverride(room.id, d.date, Number(draft)))}
                    className="text-emerald-600"
                    aria-label="Save"
                  >
                    <Check className="size-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setDraft(String(d.total));
                    setEditCell(key);
                  }}
                  title="Click to override this date's cap"
                  className={`min-w-[26px] rounded px-1 text-sm font-semibold hover:ring-1 hover:ring-gold ${
                    d.overridden ? "bg-orange-100 text-orange-700 ring-1 ring-orange-300" : "text-navy"
                  }`}
                >
                  {d.total}
                </button>
              )}
            </td>
          );
        })}
      </tr>

      {/* Bookings (auto) */}
      <tr className="border-b border-gray-50">
        <td className="sticky left-0 z-10 bg-white px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-blue-600">
          Bookings
        </td>
        {room.days.map((d) => (
          <td key={d.date} className="px-1 py-1.5 text-center">
            {d.booked > 0 ? (
              <span className="inline-block min-w-[22px] rounded bg-blue-50 px-1 text-sm font-semibold text-blue-700 ring-1 ring-blue-200">
                {d.booked}
              </span>
            ) : (
              <span className="text-gray-300">—</span>
            )}
          </td>
        ))}
      </tr>

      {/* Manual / OTA holds (editable +/-) */}
      <tr className="border-b border-gray-100">
        <td className="sticky left-0 z-10 bg-white px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600">
          Manual / OTA
        </td>
        {room.days.map((d) => {
          const past = d.date < today;
          return (
            <td key={d.date} className="px-0.5 py-1.5 text-center">
              <div className="inline-flex items-center gap-0.5">
                <button
                  disabled={pending || past || d.manual <= 0}
                  onClick={() => run(() => adjustHold(room.id, d.date, -1))}
                  className="rounded p-0.5 text-slate hover:bg-gray-100 disabled:opacity-25"
                  aria-label={`Reduce hold ${d.date}`}
                >
                  <Minus className="size-3" />
                </button>
                <span className={`min-w-[14px] text-sm font-semibold ${d.manual > 0 ? "text-amber-700" : "text-gray-400"}`}>
                  {d.manual}
                </span>
                <button
                  disabled={pending || past || d.manual >= d.total}
                  onClick={() => run(() => adjustHold(room.id, d.date, 1))}
                  className="rounded p-0.5 text-slate hover:bg-gray-100 disabled:opacity-25"
                  aria-label={`Add hold ${d.date}`}
                >
                  <Plus className="size-3" />
                </button>
              </div>
            </td>
          );
        })}
      </tr>

      {/* Available (computed) */}
      <tr className="border-b-4 border-cream">
        <td className="sticky left-0 z-10 bg-white px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
          Available
        </td>
        {room.days.map((d) => (
          <td key={d.date} className="px-1 py-1.5 text-center">
            <span className={`inline-block min-w-[24px] rounded px-1.5 py-0.5 text-sm font-bold ${availClasses(d.available, d.total)}`}>
              {d.available}
            </span>
          </td>
        ))}
      </tr>
    </>
  );
}

function Legend({ cls, label }: { cls: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`size-3 rounded ${cls}`} /> {label}
    </span>
  );
}

function BulkForm({
  title,
  hint,
  cta,
  rooms,
  defaultFrom,
  pending,
  variant = "solid",
  onSubmit,
}: {
  title: string;
  hint: string;
  cta: string;
  rooms: RoomAvailability[];
  defaultFrom: string;
  pending: boolean;
  variant?: "solid" | "outline";
  onSubmit: (roomId: string, from: string, to: string, units: number) => void;
}) {
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? "");
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState("");
  const [units, setUnits] = useState(1);

  const btn =
    variant === "solid"
      ? "bg-gold text-navy-dark hover:brightness-95"
      : "border border-navy text-navy hover:bg-navy hover:text-white";

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-card">
      <p className="font-heading font-bold uppercase tracking-wide text-navy">{title}</p>
      <p className="mt-1 text-xs text-slate">{hint}</p>
      <div className="mt-4 grid items-end gap-3 md:grid-cols-[1fr_150px_150px_120px_auto]">
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase text-slate">Room</span>
          <select value={roomId} onChange={(e) => setRoomId(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none">
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} (× {r.total_units})
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase text-slate">From</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase text-slate">To (incl.)</span>
          <input type="date" min={from} value={to} onChange={(e) => setTo(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase text-slate">Units / day</span>
          <div className="flex items-center rounded-md border border-gray-300">
            <button type="button" onClick={() => setUnits((u) => Math.max(1, u - 1))} className="px-2.5 py-2 text-slate hover:bg-gray-100" aria-label="Fewer">
              <Minus className="size-3.5" />
            </button>
            <span className="flex-1 text-center text-sm font-semibold text-navy">{units}</span>
            <button type="button" onClick={() => setUnits((u) => u + 1)} className="px-2.5 py-2 text-slate hover:bg-gray-100" aria-label="More">
              <Plus className="size-3.5" />
            </button>
          </div>
        </label>
        <button
          disabled={pending || !roomId || !from || !to}
          onClick={() => onSubmit(roomId, from, to, units)}
          className={`rounded-md px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${btn}`}
        >
          {pending ? "Working…" : cta}
        </button>
      </div>
    </div>
  );
}

// local mirror of lib/availability.addDays (client-side, for nav links)
function addDaysStr(ymd: string, n: number): string {
  const d = new Date(ymd + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBooking } from "@/app/actions/booking";
import DateRangePicker from "@/components/booking/DateRangePicker";
import OccupancyPicker, { type Occupancy } from "@/components/booking/OccupancyPicker";

function localDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const field = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40";
const label = "mb-1 block text-xs font-semibold text-navy";

export type BookingPrefill = {
  name?: string;
  phone?: string;
  email?: string;
  checkIn?: string;
  checkOut?: string;
  room?: string;
};

export default function NewBookingForm({
  roomNames,
  prefill,
}: {
  roomNames: string[];
  prefill?: BookingPrefill;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const today = localDate(0);
  const [f, setF] = useState({
    roomType: (prefill?.room && roomNames.includes(prefill.room) ? prefill.room : roomNames[0]) ?? "",
    checkIn: prefill?.checkIn ?? today,
    checkOut: prefill?.checkOut ?? localDate(1),
    name: prefill?.name ?? "",
    phone: prefill?.phone ?? "",
    email: prefill?.email ?? "",
    requests: "",
    source: "walkin" as "walkin" | "phone",
  });
  const [occ, setOcc] = useState<Occupancy>({ adults: 1, children: 0, rooms: 1 });
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await createBooking({
        roomType: f.roomType,
        checkIn: f.checkIn,
        checkOut: f.checkOut,
        guests: occ.adults + occ.children,
        roomsCount: occ.rooms,
        name: f.name,
        phone: f.phone,
        email: f.email,
        requests: f.requests,
        source: f.source,
      });
      if (!res.success) {
        setError(res.error);
        return;
      }
      router.push("/admin/bookings");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-4 rounded-lg border border-gray-100 bg-white p-5 shadow-card">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Room</span>
          <select value={f.roomType} onChange={(e) => set("roomType", e.target.value)} className={field}>
            {roomNames.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={label}>Source</span>
          <select value={f.source} onChange={(e) => set("source", e.target.value)} className={field}>
            <option value="walkin">Walk-in</option>
            <option value="phone">Phone</option>
          </select>
        </label>
        <div className="sm:col-span-2">
          <span className={label}>Dates</span>
          <DateRangePicker checkIn={f.checkIn} checkOut={f.checkOut} min={today} onChange={(ci, co) => setF((p) => ({ ...p, checkIn: ci, checkOut: co }))} />
        </div>
        <div className="sm:col-span-2">
          <span className={label}>Occupancy</span>
          <OccupancyPicker value={occ} onChange={setOcc} />
        </div>
        <label className="block">
          <span className={label}>Guest name</span>
          <input value={f.name} onChange={(e) => set("name", e.target.value)} className={field} required />
        </label>
        <label className="block">
          <span className={label}>Phone</span>
          <input value={f.phone} onChange={(e) => set("phone", e.target.value)} className={field} required />
        </label>
        <label className="block sm:col-span-2">
          <span className={label}>Email (optional)</span>
          <input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} className={field} />
        </label>
      </div>
      <label className="block">
        <span className={label}>Special request (optional)</span>
        <textarea rows={2} value={f.requests} onChange={(e) => set("requests", e.target.value)} className={field + " resize-y"} />
      </label>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={pending} className="rounded-md bg-gold px-6 py-2.5 text-sm font-semibold text-navy-dark hover:brightness-95 disabled:opacity-60">
        {pending ? "Saving…" : "Create Booking"}
      </button>
    </form>
  );
}

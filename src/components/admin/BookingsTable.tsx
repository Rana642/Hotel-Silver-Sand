"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { statusMeta, type Booking, type BookingStatus } from "@/types";

const filters: { key: BookingStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "checked_in", label: "Checked In" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "no_show", label: "No Show" },
  { key: "unreachable", label: "Unreachable" },
];

export default function BookingsTable({ bookings }: { bookings: Booking[] }) {
  const [status, setStatus] = useState<BookingStatus | "all">("all");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return bookings.filter((b) => {
      if (status !== "all" && b.status !== status) return false;
      if (!query) return true;
      return (
        b.guest_name.toLowerCase().includes(query) ||
        b.guest_phone.toLowerCase().includes(query) ||
        b.booking_ref.toLowerCase().includes(query) ||
        b.room_name.toLowerCase().includes(query)
      );
    });
  }, [bookings, status, q]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatus(f.key)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                status === f.key
                  ? "border-navy bg-navy text-white"
                  : "border-gray-200 bg-white text-navy hover:border-navy/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, phone, ref…"
            className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40 sm:w-64"
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 rounded-lg border border-gray-100 bg-white p-6 text-center text-slate shadow-card">
          No bookings match.
        </p>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="mt-4 space-y-3 sm:hidden">
            {rows.map((b) => (
              <Link
                key={b.id}
                href={`/admin/bookings/${b.id}`}
                className="block rounded-lg border border-gray-100 bg-white p-4 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-navy">{b.guest_name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusMeta[b.status].cls}`}>
                    {statusMeta[b.status].label}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate">{b.room_name}</p>
                <p className="text-xs text-slate">
                  {b.check_in} → {b.check_out} · {b.guest_phone}
                </p>
                <p className="mt-1 text-xs font-semibold text-navy/60">{b.booking_ref}</p>
              </Link>
            ))}
          </div>

          {/* Desktop table */}
          <div className="mt-4 hidden overflow-x-auto rounded-lg border border-gray-100 bg-white shadow-card sm:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 text-xs uppercase text-slate">
                <tr>
                  <th className="px-4 py-3">Ref</th>
                  <th className="px-4 py-3">Guest</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 last:border-0 hover:bg-cream/50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/bookings/${b.id}`} className="font-semibold text-navy hover:text-gold">
                        {b.booking_ref}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-navy">{b.guest_name}</td>
                    <td className="px-4 py-3 text-slate">{b.guest_phone}</td>
                    <td className="px-4 py-3 text-slate">{b.room_name}</td>
                    <td className="px-4 py-3 text-slate">
                      {b.check_in} → {b.check_out}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusMeta[b.status].cls}`}>
                        {statusMeta[b.status].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

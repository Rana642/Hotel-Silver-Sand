"use client";

import { useState, useTransition } from "react";
import { Search, CheckCircle2, Phone, MessageCircle } from "lucide-react";
import { lookupBooking, type ManageBookingResult } from "@/app/actions/booking";
import { site, tel, waLink } from "@/data/site";
import { fmtDate, pkr } from "@/lib/format";

const statusLabel: Record<string, string> = {
  pending: "Pending Confirmation",
  confirmed: "Confirmed",
  checked_in: "Checked In",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
  unreachable: "Unreachable",
};

export default function ManageBookingForm() {
  const [ref, setRef] = useState("");
  const [contact, setContact] = useState("");
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ManageBookingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!ref.trim() || !contact.trim()) {
      setError("Please enter your Booking ID and the email or phone used.");
      return;
    }
    start(async () => {
      const res = await lookupBooking(ref, contact);
      if (!res.found) setError("No booking found for that ID and email/phone. Please check and try again.");
      setResult(res);
    });
  }

  const field = "w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40";

  return (
    <div className="mx-auto max-w-xl">
      <form onSubmit={submit} className="rounded-xl border border-gray-100 bg-white p-6 shadow-card">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-navy">Booking ID <span className="text-red-500">*</span></span>
          <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. HSS-AB3K9P" className={field + " uppercase"} />
        </label>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-semibold text-navy">Email or Phone <span className="text-red-500">*</span></span>
          <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Email or phone used to book" className={field} />
        </label>
        {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={pending} className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 font-semibold text-navy-dark transition hover:brightness-95 disabled:opacity-60">
          <Search className="size-4" /> {pending ? "Searching…" : "Get My Booking"}
        </button>
      </form>

      {result?.found && (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-card">
          <div className="flex items-center gap-3 border-b border-gray-100 bg-cream px-6 py-4">
            <CheckCircle2 className="size-6 text-green-500" />
            <div>
              <p className="font-heading font-bold text-navy">Booking Found</p>
              <p className="text-sm text-slate">{result.booking.booking_ref}</p>
            </div>
          </div>
          <table className="w-full text-left text-sm">
            <tbody>
              {[
                ["Guest", result.booking.guest_name],
                ["Room", result.booking.room_name],
                ["Check-in", fmtDate(result.booking.check_in)],
                ["Check-out", fmtDate(result.booking.check_out)],
                ["Nights", String(result.booking.nights)],
                ["Guests", String(result.booking.guests)],
                ["Total", pkr(Number(result.booking.total))],
                ["Status", statusLabel[result.booking.status] ?? result.booking.status],
              ].map(([k, v]) => (
                <tr key={k} className="border-b border-gray-50 last:border-0">
                  <td className="w-32 px-6 py-3 font-medium text-slate">{k}</td>
                  <td className="px-6 py-3 text-navy">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-col gap-2 border-t border-gray-100 p-4 sm:flex-row">
            <a href={tel} className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-navy/20 px-4 py-2.5 text-sm font-semibold text-navy hover:bg-navy hover:text-white">
              <Phone className="size-4" /> Call Hotel
            </a>
            <a href={waLink(`Hi, regarding my booking ${result.booking.booking_ref} at ${site.name}.`)} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-95">
              <MessageCircle className="size-4" /> WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

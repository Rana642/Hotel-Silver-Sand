import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { site } from "@/data/site";
import { fmtDate, fmtDateTime, pkr } from "@/lib/format";
import type { Booking } from "@/types";
import PrintButton from "@/components/admin/PrintButton";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("bookings").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const b = data as Booking;

  const savings =
    b.original_price && b.original_price > b.unit_price
      ? (b.original_price - b.unit_price) * b.nights * b.rooms_count
      : 0;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex justify-between print:hidden">
        <a href={`/admin/bookings/${b.id}`} className="text-sm font-semibold text-navy hover:text-gold">
          ← Back
        </a>
        <PrintButton />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-8 text-navy shadow-card print:border-0 print:shadow-none">
        <div className="flex items-start justify-between border-b border-gray-200 pb-4">
          <div>
            <h1 className="font-heading text-xl font-bold">{site.name}</h1>
            <p className="text-xs text-slate">Established 1986</p>
            <p className="mt-1 max-w-xs text-xs text-slate">{site.address.full}</p>
            <p className="text-xs text-slate">{site.phone} · {site.email}</p>
          </div>
          <div className="text-right">
            <p className="font-heading text-lg font-bold">RECEIPT</p>
            <p className="text-xs text-slate">{b.booking_ref}</p>
            <p className="text-xs text-slate">{fmtDateTime(b.created_at)}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase text-slate">Guest</p>
            <p className="font-medium">{b.guest_name}</p>
            <p className="text-slate">{b.guest_phone}</p>
            {b.guest_email && <p className="text-slate">{b.guest_email}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase text-slate">Stay</p>
            <p className="font-medium">{b.room_name}</p>
            <p className="text-slate">{fmtDate(b.check_in)} → {fmtDate(b.check_out)}</p>
            <p className="text-slate">
              {b.nights} night{b.nights > 1 ? "s" : ""} · {b.guests} guest{b.guests > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs uppercase text-slate">
              <th className="py-2">Description</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-2">
                {b.room_name} — {pkr(b.unit_price)} × {b.nights} night{b.nights > 1 ? "s" : ""}
                {b.rooms_count > 1 ? ` × ${b.rooms_count} rooms` : ""}
              </td>
              <td className="py-2 text-right">{pkr(b.total)}</td>
            </tr>
            {savings > 0 && (
              <tr className="border-b border-gray-100 text-green-600">
                <td className="py-2">Discount</td>
                <td className="py-2 text-right">− {pkr(savings)}</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="text-base font-bold">
              <td className="py-3">Total</td>
              <td className="py-3 text-right">{pkr(b.total)}</td>
            </tr>
          </tfoot>
        </table>

        <p className="mt-6 border-t border-gray-200 pt-4 text-center text-xs text-slate">
          Thank you for choosing {site.name}. We look forward to your stay.
        </p>
      </div>
    </div>
  );
}

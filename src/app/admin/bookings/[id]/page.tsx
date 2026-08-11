import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, MessageCircle, Mail, Printer } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import BookingActions from "@/components/admin/BookingActions";
import { statusMeta, type Booking } from "@/types";
import { fmtDate, fmtDateTime, pkr } from "@/lib/format";

export const dynamic = "force-dynamic";

function waLink(phone: string, ref: string) {
  const digits = phone.replace(/[^\d]/g, "").replace(/^0/, "92");
  return `https://wa.me/${digits}?text=${encodeURIComponent(
    `Hello, regarding your booking ${ref} at Hotel Silver Sand Multan.`
  )}`;
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("bookings").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const b = data as Booking;

  const savings =
    b.original_price && b.original_price > b.unit_price
      ? (b.original_price - b.unit_price) * b.nights * b.rooms_count
      : 0;

  const detailRows: [string, React.ReactNode][] = [
    ["Booking Ref", <span key="r" className="font-semibold">{b.booking_ref}</span>],
    ["Room", b.room_name],
    ["Check-in", fmtDate(b.check_in)],
    ["Check-out", fmtDate(b.check_out)],
    ["Nights", b.nights],
    ["Guests", b.guests],
    ["Rooms", b.rooms_count],
    ["Source", b.source],
    ["Created", fmtDateTime(b.created_at)],
    ["Special request", b.special_request || "—"],
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/bookings" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-gold">
          <ArrowLeft className="size-4" /> Back to bookings
        </Link>
        <Link
          href={`/admin/bookings/${b.id}/receipt`}
          className="inline-flex items-center gap-1.5 rounded-md border border-navy/20 px-3 py-1.5 text-sm font-semibold text-navy hover:bg-navy hover:text-white"
        >
          <Printer className="size-4" /> Print Receipt
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-navy">{b.guest_name}</h1>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusMeta[b.status].cls}`}>
          {statusMeta[b.status].label}
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Contact */}
          <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-card">
            <p className="text-sm font-semibold text-navy">Guest Contact</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={`tel:${b.guest_phone}`} className="flex items-center gap-1.5 rounded-md border border-navy/20 px-3 py-2 text-sm font-semibold text-navy hover:bg-navy hover:text-white">
                <Phone className="size-4" /> {b.guest_phone}
              </a>
              <a href={waLink(b.guest_phone, b.booking_ref)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-md bg-[#25D366] px-3 py-2 text-sm font-semibold text-white hover:brightness-95">
                <MessageCircle className="size-4" /> WhatsApp
              </a>
              {b.guest_email && (
                <a href={`mailto:${b.guest_email}`} className="flex items-center gap-1.5 rounded-md border border-navy/20 px-3 py-2 text-sm font-semibold text-navy hover:bg-navy hover:text-white">
                  <Mail className="size-4" /> {b.guest_email}
                </a>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <tbody>
                {detailRows.map(([k, v]) => (
                  <tr key={k} className="border-b border-gray-50 last:border-0">
                    <td className="w-40 px-4 py-3 font-medium text-slate">{k}</td>
                    <td className="px-4 py-3 text-navy">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financials */}
          <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-card">
            <p className="text-sm font-semibold text-navy">Charges</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between text-slate">
                <span>{pkr(b.unit_price)} × {b.nights} night{b.nights > 1 ? "s" : ""}{b.rooms_count > 1 ? ` × ${b.rooms_count} rooms` : ""}</span>
                <span className="text-navy">{pkr(b.total)}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount applied</span>
                  <span>− {pkr(savings)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-100 pt-2 font-bold text-navy">
                <span>Total</span>
                <span className="text-gold">{pkr(b.total)}</span>
              </div>
            </div>
          </div>

          {b.admin_notes && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-semibold text-amber-800">Internal Notes</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-amber-900">{b.admin_notes}</p>
            </div>
          )}
        </div>

        <BookingActions id={b.id} current={b.status} checkOut={b.check_out} notes={b.admin_notes} />
      </div>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, MessageCircle, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import BookingActions from "@/components/admin/BookingActions";
import { statusMeta, type Booking } from "@/types";

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

  const rows: [string, React.ReactNode][] = [
    ["Booking Ref", <span key="r" className="font-semibold">{b.booking_ref}</span>],
    ["Room", b.room_name],
    ["Check-in", b.check_in],
    ["Check-out", b.check_out],
    ["Nights", b.nights],
    ["Guests", b.guests],
    ["Rooms", b.rooms_count],
    ["Source", b.source],
    ["Created", new Date(b.created_at).toLocaleString()],
    ["Special request", b.special_request || "—"],
  ];

  return (
    <div>
      <Link href="/admin/bookings" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-gold">
        <ArrowLeft className="size-4" /> Back to bookings
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-navy">{b.guest_name}</h1>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusMeta[b.status].cls}`}>
          {statusMeta[b.status].label}
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
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

          <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <tbody>
                {rows.map(([k, v]) => (
                  <tr key={k} className="border-b border-gray-50 last:border-0">
                    <td className="w-40 px-4 py-3 font-medium text-slate">{k}</td>
                    <td className="px-4 py-3 text-navy">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <BookingActions id={b.id} current={b.status} />
      </div>
    </div>
  );
}

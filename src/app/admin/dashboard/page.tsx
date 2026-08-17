import Link from "next/link";
import { CalendarCheck, Clock, CheckCircle2, TrendingUp, Contact } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { statusMeta, type Booking } from "@/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });

  const bookings = (data ?? []) as Booking[];
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);

  // Unique guests (contacts) merged by phone digits, else email, else name.
  const contactKeys = new Set(
    bookings.map((b) => {
      const digits = (b.guest_phone ?? "").replace(/\D/g, "");
      if (digits.length >= 7) return "p:" + digits.slice(-10);
      if (b.guest_email) return "e:" + b.guest_email.trim().toLowerCase();
      return "n:" + (b.guest_name ?? "").trim().toLowerCase();
    })
  );

  const stats = [
    { label: "Total Bookings", value: bookings.length, icon: CalendarCheck, href: "/admin/bookings" },
    { label: "Pending", value: bookings.filter((b) => b.status === "pending").length, icon: Clock, href: "/admin/bookings" },
    {
      label: "Confirmed",
      value: bookings.filter((b) => b.status === "confirmed" || b.status === "checked_in").length,
      icon: CheckCircle2,
      href: "/admin/bookings",
    },
    {
      label: "This Month",
      value: bookings.filter((b) => b.created_at.slice(0, 10) >= monthStart).length,
      icon: TrendingUp,
      href: "/admin/bookings",
    },
    { label: "Contacts", value: contactKeys.size, icon: Contact, href: "/admin/contacts" },
  ];

  const recent = bookings.slice(0, 8);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-lg border border-gray-100 bg-white p-5 shadow-card transition hover:border-gold/40 hover:shadow-pop"
          >
            <Icon className="size-6 text-gold" />
            <p className="mt-3 font-heading text-3xl font-bold text-navy">{value}</p>
            <p className="text-sm text-slate">{label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-navy">Recent Bookings</h2>
          <Link href="/admin/bookings" className="text-sm font-semibold text-gold hover:underline">
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="mt-4 rounded-lg border border-gray-100 bg-white p-6 text-center text-slate shadow-card">
            No bookings yet.
          </p>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="mt-4 space-y-3 sm:hidden">
              {recent.map((b) => (
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
                    {b.check_in} → {b.check_out} · {b.booking_ref}
                  </p>
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
                    <th className="px-4 py-3">Room</th>
                    <th className="px-4 py-3">Dates</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((b) => (
                    <tr key={b.id} className="border-b border-gray-50 last:border-0 hover:bg-cream/50">
                      <td className="px-4 py-3">
                        <Link href={`/admin/bookings/${b.id}`} className="font-semibold text-navy hover:text-gold">
                          {b.booking_ref}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-navy">{b.guest_name}</td>
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
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import BookingsTable from "@/components/admin/BookingsTable";
import type { Booking } from "@/types";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">Bookings</h1>
      <p className="mt-1 text-sm text-slate">Manage all reservation requests.</p>
      <div className="mt-6">
        <BookingsTable bookings={(data ?? []) as Booking[]} />
      </div>
    </div>
  );
}

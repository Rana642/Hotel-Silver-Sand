import Link from "next/link";
import { Plus } from "lucide-react";
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy">Bookings</h1>
          <p className="mt-1 text-sm text-slate">Manage all reservation requests.</p>
        </div>
        <Link
          href="/admin/bookings/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-navy-dark hover:brightness-95"
        >
          <Plus className="size-4" /> New
        </Link>
      </div>
      <div className="mt-6">
        <BookingsTable bookings={(data ?? []) as Booking[]} />
      </div>
    </div>
  );
}

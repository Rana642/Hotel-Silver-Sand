import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import NewBookingForm from "@/components/admin/NewBookingForm";

export const dynamic = "force-dynamic";

export default async function NewBookingPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("rooms").select("name").eq("is_active", true).order("sort_order");
  const roomNames = (data ?? []).map((r) => r.name as string);

  return (
    <div>
      <Link href="/admin/bookings" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-gold">
        <ArrowLeft className="size-4" /> Back to bookings
      </Link>
      <h1 className="mt-4 font-heading text-2xl font-bold text-navy">New Booking</h1>
      <p className="mt-1 text-sm text-slate">Record a walk-in or phone reservation.</p>
      <div className="mt-6">
        <NewBookingForm roomNames={roomNames} />
      </div>
    </div>
  );
}

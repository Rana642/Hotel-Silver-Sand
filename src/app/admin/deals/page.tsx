import DealsEditor, { type DealRow, type RoomOpt } from "@/components/admin/DealsEditor";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDealsPage() {
  const supabase = await createClient();
  const [{ data: deals }, { data: rooms }] = await Promise.all([
    supabase.from("rate_deals").select("*").order("priority", { ascending: false }).order("start_date"),
    supabase.from("rooms").select("id, name").eq("is_active", true).order("sort_order"),
  ]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">Deals &amp; Discounts</h1>
      <p className="mt-1 text-sm text-slate">
        Create automatic discounts for a date range (e.g. Early Bird, Last Minute, Eid Special). When a guest&apos;s
        check-in date falls in the window, the deal&apos;s discount and cancellation policy show and apply on the
        booking page automatically — no coupon code needed.
      </p>
      <div className="mt-6">
        <DealsEditor deals={(deals ?? []) as DealRow[]} rooms={(rooms ?? []) as RoomOpt[]} />
      </div>
    </div>
  );
}

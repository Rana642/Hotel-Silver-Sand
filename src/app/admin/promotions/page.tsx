import { createClient } from "@/lib/supabase/server";
import { getRole } from "@/lib/auth";
import PromotionsEditor, { type Promotion, type RoomOpt } from "@/components/admin/PromotionsEditor";

export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage() {
  const supabase = await createClient();
  const [{ data }, { data: rooms }, role] = await Promise.all([
    supabase.from("promotions").select("*").order("sort_order"),
    supabase.from("rooms").select("id, name").eq("is_active", true).order("sort_order"),
    getRole(),
  ]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">Promotions &amp; Deals</h1>
      <p className="mt-1 text-sm text-slate">
        Marketing cards for the Promotions page. Add a discount % and check-in date range to also make a promotion
        apply automatically as a deal on the booking page.
      </p>
      <div className="mt-6">
        <PromotionsEditor promotions={(data ?? []) as Promotion[]} rooms={(rooms ?? []) as RoomOpt[]} isAdmin={role === "admin"} />
      </div>
    </div>
  );
}

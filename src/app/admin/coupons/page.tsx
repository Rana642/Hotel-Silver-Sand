import { createClient } from "@/lib/supabase/server";
import { getRole } from "@/lib/auth";
import CouponsManager, { type Coupon } from "@/components/admin/CouponsManager";

export const dynamic = "force-dynamic";

export default async function CouponsPage() {
  const supabase = await createClient();
  const [{ data }, role] = await Promise.all([
    supabase.from("coupons").select("*").order("created_at", { ascending: false }),
    getRole(),
  ]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">Coupons</h1>
      <p className="mt-1 text-sm text-slate">Discount codes applied at the booking form.</p>
      <div className="mt-6">
        <CouponsManager coupons={(data ?? []) as Coupon[]} isAdmin={role === "admin"} />
      </div>
    </div>
  );
}

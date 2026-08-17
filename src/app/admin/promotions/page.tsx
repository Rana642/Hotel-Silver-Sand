import { createClient } from "@/lib/supabase/server";
import { getRole } from "@/lib/auth";
import PromotionsEditor, { type Promotion } from "@/components/admin/PromotionsEditor";

export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage() {
  const supabase = await createClient();
  const [{ data }, role] = await Promise.all([
    supabase.from("promotions").select("*").order("sort_order"),
    getRole(),
  ]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">Promotions</h1>
      <p className="mt-1 text-sm text-slate">Add, edit or remove the deals shown on the Promotions page.</p>
      <div className="mt-6">
        <PromotionsEditor promotions={(data ?? []) as Promotion[]} isAdmin={role === "admin"} />
      </div>
    </div>
  );
}

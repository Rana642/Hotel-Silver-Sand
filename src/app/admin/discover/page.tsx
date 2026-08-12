import { createClient } from "@/lib/supabase/server";
import { getRole } from "@/lib/auth";
import DiscoverEditor, { type Destination } from "@/components/admin/DiscoverEditor";

export const dynamic = "force-dynamic";

export default async function AdminDiscoverPage() {
  const supabase = await createClient();
  const [{ data }, role] = await Promise.all([
    supabase.from("destinations").select("*").order("sort_order"),
    getRole(),
  ]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">Discover Multan</h1>
      <p className="mt-1 text-sm text-slate">Add, edit or reorder the destinations shown on the Discover page.</p>
      <div className="mt-6">
        <DiscoverEditor destinations={(data ?? []) as Destination[]} isAdmin={role === "admin"} />
      </div>
    </div>
  );
}

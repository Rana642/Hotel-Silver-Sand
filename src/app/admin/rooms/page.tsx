import { createClient } from "@/lib/supabase/server";
import RoomsEditor from "@/components/admin/RoomsEditor";
import type { RoomRow } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminRoomsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("rooms").select("*").order("sort_order");

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">Rooms</h1>
      <p className="mt-1 text-sm text-slate">Update pricing and availability of each room type.</p>
      <div className="mt-6">
        <RoomsEditor rooms={(data ?? []) as RoomRow[]} />
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import ActivityList, { type ActivityRow } from "@/components/admin/ActivityList";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">Activity Log</h1>
      <p className="mt-1 text-sm text-slate">Audit trail of admin actions (Karachi time).</p>
      <div className="mt-6">
        <ActivityList rows={(data ?? []) as ActivityRow[]} />
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { getRole } from "@/lib/auth";
import InquiriesTable, { type Inquiry } from "@/components/admin/InquiriesTable";

export const dynamic = "force-dynamic";

export default async function InquiriesPage() {
  const supabase = await createClient();
  const [{ data }, role] = await Promise.all([
    supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
    getRole(),
  ]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">Inquiries</h1>
      <p className="mt-1 text-sm text-slate">Leads captured from the website contact form.</p>
      <div className="mt-6">
        <InquiriesTable inquiries={(data ?? []) as Inquiry[]} isAdmin={role === "admin"} />
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";

export type StaffRole = "admin" | "reception";

/** Current logged-in staff member's role (server-side). Defaults to reception. */
export async function getRole(): Promise<StaffRole> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "reception";
  const { data } = await supabase.from("admin_users").select("role").eq("id", user.id).maybeSingle();
  return data?.role === "admin" ? "admin" : "reception";
}

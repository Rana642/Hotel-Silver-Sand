"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Append an entry to the audit trail. Records the acting staff member's email.
 * Fire-and-forget: logging failure must never break the underlying action.
 */
export async function logActivity(
  action: string,
  entity: string,
  entityId: string,
  detail?: string
): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("activity_log").insert({
      user_email: user?.email ?? null,
      action,
      entity,
      entity_id: entityId,
      detail: detail ?? null,
    });
  } catch {
    // ignore — audit logging is best-effort
  }
}

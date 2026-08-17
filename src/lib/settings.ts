import { createServiceClient } from "@/lib/supabase/service";

export async function getSetting(key: string): Promise<string | null> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("app_settings").select("value").eq("key", key).maybeSingle();
  return (data?.value as string | undefined) ?? null;
}

/** Recipient for booking/inquiry notifications: admin-set value, else env fallback. */
export async function getNotifyEmail(): Promise<string | null> {
  const fromDb = await getSetting("notify_email");
  return fromDb || process.env.NOTIFY_EMAIL || null;
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/app/actions/activity";
import { sendEmail, emailConfigured } from "@/lib/email";
import { getNotifyEmail } from "@/lib/settings";
import { site } from "@/data/site";

type Res = { ok: true } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function setNotifyEmail(email: string): Promise<Res> {
  const val = email.trim().toLowerCase();
  if (!EMAIL_RE.test(val)) return { ok: false, error: "Please enter a valid email address." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("app_settings")
    .upsert({ key: "notify_email", value: val, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) return { ok: false, error: error.message };
  await logActivity("settings.notify_email", "settings", "notify_email", val);
  return { ok: true };
}

export async function clearNotifyEmail(): Promise<Res> {
  const supabase = await createClient();
  const { error } = await supabase.from("app_settings").delete().eq("key", "notify_email");
  if (error) return { ok: false, error: error.message };
  await logActivity("settings.notify_email", "settings", "notify_email", "(cleared)");
  return { ok: true };
}

export async function sendTestEmail(): Promise<Res> {
  if (!emailConfigured()) return { ok: false, error: "RESEND_API_KEY / RESEND_FROM are not set in the environment." };
  const to = await getNotifyEmail();
  if (!to) return { ok: false, error: "No notification recipient is set." };
  const res = await sendEmail({
    to,
    subject: `Test email — ${site.name}`,
    html: `<div style="font-family:Arial,sans-serif;color:#0b2b4b;padding:16px">
      <h2 style="color:#0b2b4b">Email notifications are working ✅</h2>
      <p>This is a test from your ${site.name} admin panel. New bookings and inquiries will be emailed to <b>${to}</b>.</p>
    </div>`,
  });
  return res.ok ? { ok: true } : { ok: false, error: res.error };
}

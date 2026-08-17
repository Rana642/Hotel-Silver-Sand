/**
 * Minimal Resend email sender (server-only). No SDK dependency — posts to the
 * Resend REST API. Configure RESEND_API_KEY and RESEND_FROM in the environment.
 * RESEND_FROM must use a domain verified in your Resend account, e.g.
 *   "Hotel Silver Sand <noreply@hotelsilversandmultan.com>"
 */
export type SendResult = { ok: true } | { ok: false; error: string };

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM);
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from) return { ok: false, error: "RESEND_API_KEY / RESEND_FROM not set" };
  if (!opts.to) return { ok: false, error: "No recipient configured" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[email] resend error:", res.status, text.slice(0, 300));
      return { ok: false, error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    console.error("[email] send failed:", (e as Error).message);
    return { ok: false, error: (e as Error).message };
  } finally {
    clearTimeout(timeout);
  }
}

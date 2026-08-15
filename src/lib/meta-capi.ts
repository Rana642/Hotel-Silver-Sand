import crypto from "node:crypto";
import { headers, cookies } from "next/headers";

/**
 * Meta Conversions API (server-side) helper.
 * Docs: https://developers.facebook.com/docs/marketing-api/conversions-api
 *
 * - Fires events directly from our server to Meta (bypasses browser blockers).
 * - Provides an event_id so Meta can deduplicate against the browser Pixel.
 * - User data is hashed with SHA256 lowercase-trimmed (Meta's required format).
 * - Fire-and-forget: any error is logged, never thrown to the caller.
 */

const GRAPH_VERSION = "v20.0";

function sha256(v: string) {
  return crypto.createHash("sha256").update(v.trim().toLowerCase()).digest("hex");
}

/** Pakistan phone → E.164 digits (no +) as Meta requires. */
function normPhone(phone: string) {
  const digits = phone.replace(/[^\d]/g, "").replace(/^0/, "92");
  return digits;
}

export type CapiUser = { email?: string | null; phone?: string | null; name?: string | null };
export type CapiCustom = {
  currency?: string;
  value?: number;
  content_name?: string;
  content_ids?: string[];
};

export type CapiEvent = {
  name: "Lead" | "InitiateCheckout" | "Contact" | "Schedule" | "ViewContent";
  eventId: string;
  eventSourceUrl?: string;
  user?: CapiUser;
  custom?: CapiCustom;
};

export async function sendMetaEvent(evt: CapiEvent): Promise<{ ok: boolean; error?: string }> {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_ACCESS_TOKEN;
  if (!pixelId || !token) return { ok: false, error: "META_PIXEL_ID / META_ACCESS_TOKEN not set" };

  const h = await headers();
  const c = await cookies();
  const clientIp =
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    h.get("x-real-ip") ||
    undefined;
  const userAgent = h.get("user-agent") || undefined;
  const fbp = c.get("_fbp")?.value;
  const fbc = c.get("_fbc")?.value;

  const nameParts = (evt.user?.name || "").trim().split(/\s+/).filter(Boolean);
  const fn = nameParts[0];
  const ln = nameParts.slice(1).join(" ") || undefined;

  const user_data: Record<string, unknown> = {};
  if (evt.user?.email) user_data.em = [sha256(evt.user.email)];
  if (evt.user?.phone) user_data.ph = [sha256(normPhone(evt.user.phone))];
  if (fn) user_data.fn = [sha256(fn)];
  if (ln) user_data.ln = [sha256(ln)];
  if (clientIp) user_data.client_ip_address = clientIp;
  if (userAgent) user_data.client_user_agent = userAgent;
  if (fbp) user_data.fbp = fbp;
  if (fbc) user_data.fbc = fbc;

  const custom_data: Record<string, unknown> = {};
  if (evt.custom?.currency) custom_data.currency = evt.custom.currency;
  if (typeof evt.custom?.value === "number") custom_data.value = evt.custom.value;
  if (evt.custom?.content_name) custom_data.content_name = evt.custom.content_name;
  if (evt.custom?.content_ids) custom_data.content_ids = evt.custom.content_ids;

  const body = {
    data: [
      {
        event_name: evt.name,
        event_time: Math.floor(Date.now() / 1000),
        event_id: evt.eventId,
        action_source: "website",
        event_source_url: evt.eventSourceUrl,
        user_data,
        custom_data,
      },
    ],
  };

  // Bound the request so a slow Meta endpoint never blocks the booking response.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: controller.signal,
      }
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[meta-capi] non-2xx:", res.status, text.slice(0, 300));
      return { ok: false, error: `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    console.error("[meta-capi] fetch failed:", (e as Error).message);
    return { ok: false, error: (e as Error).message };
  } finally {
    clearTimeout(timeout);
  }
}

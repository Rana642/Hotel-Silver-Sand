/**
 * GA4 Measurement Protocol (server to Google). The browser's gtag events never arrive for guests with an ad blocker or
 * who close the tab before the thank-you page, so GA4 and Google Ads under-counted real bookings. The booking is saved
 * on the server, so the server also tells GA4.
 *
 * Needs GA4_API_SECRET (GA4 → Admin → Data streams → Measurement Protocol API secrets). Without it this is a no-op.
 * GA4_MP_DEBUG=true sends to Google's validation endpoint instead (nothing is recorded) and returns its messages.
 */

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_ID;
const API_SECRET = process.env.GA4_API_SECRET;
const DEBUG = process.env.GA4_MP_DEBUG === "true";
const ENDPOINT = DEBUG ? "https://www.google-analytics.com/debug/mp/collect" : "https://www.google-analytics.com/mp/collect";

type Ga4Event = { name: string; params: Record<string, unknown> };

/** GA4's own client_id shape: "<random>.<unix seconds>". Used only when the guest's `_ga` cookie wasn't captured. */
function fallbackClientId(): string {
  return `${Math.floor(Math.random() * 1_000_000_000)}.${Math.floor(Date.now() / 1000)}`;
}

export async function sendGa4ServerEvent(
  event: Ga4Event,
  clientId?: string | null
): Promise<{ ok: boolean; error?: string }> {
  if (!MEASUREMENT_ID || !API_SECRET) return { ok: false, error: "GA4_API_SECRET not set" };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(`${ENDPOINT}?measurement_id=${encodeURIComponent(MEASUREMENT_ID)}&api_secret=${encodeURIComponent(API_SECRET)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId || fallbackClientId(), events: [event] }),
      cache: "no-store",
      signal: controller.signal,
    });
    if (DEBUG) {
      const json = (await res.json().catch(() => null)) as { validationMessages?: unknown[] } | null;
      if (json?.validationMessages?.length) {
        console.error("[ga4-mp] validation:", JSON.stringify(json.validationMessages));
        return { ok: false, error: "validation failed" };
      }
      return { ok: true };
    }
    if (!res.ok) {
      console.error("[ga4-mp] HTTP", res.status);
      return { ok: false, error: `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    console.error("[ga4-mp] failed:", (e as Error).message);
    return { ok: false, error: (e as Error).message };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Push an event to the GTM dataLayer. GTM handles fan-out to GA4 and Meta Pixel.
 * Safe on the server (no-op) and safe when GTM isn't installed.
 */
export type EventName =
  | "call_click"
  | "whatsapp_click"
  | "bookingcom_click"
  | "directions_click"
  | "email_click"
  | "view_item"
  | "view_item_list"
  | "contact_form_submit"
  | "begin_checkout"
  | "booking_confirmed";

type DataLayerWindow = Window & { dataLayer?: Record<string, unknown>[] };

export function trackEvent(event: EventName, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const w = window as DataLayerWindow;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...params });
}

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void };

/**
 * Fire a Google Ads click conversion directly via gtag (no GTM round-trip).
 * `label` is the conversion label for AW-<id>/<label>. No-op if Ads not set.
 */
export function trackAdsConversion(label?: string) {
  if (typeof window === "undefined") return;
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  if (!adsId || !label) return;
  const w = window as GtagWindow;
  if (typeof w.gtag !== "function") return;
  w.gtag("event", "conversion", { send_to: `${adsId}/${label}` });
}

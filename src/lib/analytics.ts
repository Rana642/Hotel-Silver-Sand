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

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void };

/** Fire a GA4 event directly via gtag. Safe on the server and when GA4 isn't set. */
export function trackEvent(event: EventName, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_GA4_ID) return;
  const w = window as GtagWindow;
  if (typeof w.gtag !== "function") return;
  w.gtag("event", event, params);
}

/**
 * Fire a Google Ads click conversion directly via gtag. `label` is the
 * conversion label for AW-<id>/<label>. No-op if Ads not set.
 */
export function trackAdsConversion(label?: string) {
  if (typeof window === "undefined") return;
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  if (!adsId || !label) return;
  const w = window as GtagWindow;
  if (typeof w.gtag !== "function") return;
  w.gtag("event", "conversion", { send_to: `${adsId}/${label}` });
}

type FbqWindow = Window & { fbq?: (...args: unknown[]) => void };

/**
 * Fire a Meta Pixel event directly via fbq. `eventId` must match the id
 * passed to the matching server-side CAPI call so Meta dedupes the browser +
 * server signal instead of double-counting.
 */
export function trackMetaPixel(
  eventName: "Lead" | "Contact" | "InitiateCheckout" | "Schedule" | "ViewContent" | "Search" | "Purchase",
  params: Record<string, unknown>,
  eventId: string
) {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_META_PIXEL_ID) return;
  const w = window as FbqWindow;
  if (typeof w.fbq !== "function") return;
  w.fbq("track", eventName, params, { eventID: eventId });
}

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

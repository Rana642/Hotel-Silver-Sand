"use client";

import { useEffect } from "react";
import { captureFirstTouch, addRefToWhatsAppHref } from "@/lib/attribution";
import { trackEvent, trackAdsConversion } from "@/lib/analytics";

/** Pages where a WhatsApp/call tap comes from a guest who has ALREADY booked —
 *  not a new lead, so no conversion and no ref rewrite. */
const POST_BOOKING = ["/thank-you", "/manage-booking", "/admin"];

/**
 * Stores the visitor's first-touch source (see lib/attribution.ts) and, for
 * every plain wa.me / tel: link on the site:
 *  - appends the "Ref:" code to the WhatsApp message, and
 *  - fires the Google Ads WhatsApp / Call conversion (+ GA4 event unless the
 *    link is a <TrackedLink>, which already sends its own GA4 event).
 * One capture-phase listener instead of wiring every anchor by hand.
 * Renders nothing.
 */
export default function AttributionCapture() {
  useEffect(() => {
    captureFirstTouch();

    const onClick = (e: MouseEvent) => {
      if (POST_BOOKING.some((p) => window.location.pathname.startsWith(p))) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") || "";
      const isWa = /^https:\/\/wa\.me\//.test(href);
      const isTel = href.startsWith("tel:");
      if (!isWa && !isTel) return;

      if (isWa) a.setAttribute("href", addRefToWhatsAppHref(href));
      const tracked = a.hasAttribute("data-tracked");
      if (!tracked) trackEvent(isWa ? "whatsapp_click" : "call_click", { location: window.location.pathname });
      trackAdsConversion(
        isWa ? process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_WHATSAPP : process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_CALL
      );
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}

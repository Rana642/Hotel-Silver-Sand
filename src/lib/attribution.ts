/**
 * First-touch attribution + the WhatsApp "Ref:" code.
 *
 * Most bookings close on WhatsApp/phone, where the ad platforms can't see the
 * source. So the first landing's source is stored for 30 days and appended to
 * every WhatsApp message as "Ref: GA-<code>" — the front desk (and Shoaib)
 * can then tell Google Ads, Meta and organic leads apart in the chat itself.
 *
 *   GA = Google Ads (gclid / gbraid / wbraid, or utm_source=google + paid medium)
 *   FB = Meta (fbclid, or utm_source facebook / instagram / meta / fb / ig)
 *   GS = Google organic (referrer google.*, no click id)
 *   WEB = anything else (direct, other referrers)
 * The code after the dash is utm_content (or utm_campaign), shortened.
 */
const KEY = "hss_first_touch";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

type Touch = {
  src: "GA" | "FB" | "GS" | "WEB";
  code: string;
  at: number;
  /** Full first-touch details, saved on website bookings (migration-phase17). */
  utm?: { source?: string; medium?: string; campaign?: string; content?: string; term?: string };
  gclid?: string;
  fbclid?: string;
  landing?: string;
  referrer?: string;
};

const clip = (v: string | null | undefined, n = 120) => (v ? v.slice(0, n) : undefined);

function classify(url: URL, referrer: string): Touch {
  const p = url.searchParams;
  const utmSource = (p.get("utm_source") || "").toLowerCase();
  const utmMedium = (p.get("utm_medium") || "").toLowerCase();
  const code = (p.get("utm_content") || p.get("utm_campaign") || "")
    .replace(/[^A-Za-z0-9_-]/g, "")
    .slice(0, 16);
  const now = Date.now();
  const details = {
    utm: {
      source: clip(p.get("utm_source")),
      medium: clip(p.get("utm_medium")),
      campaign: clip(p.get("utm_campaign")),
      content: clip(p.get("utm_content")),
      term: clip(p.get("utm_term")),
    },
    gclid: clip(p.get("gclid") || p.get("gbraid") || p.get("wbraid"), 200),
    fbclid: clip(p.get("fbclid"), 200),
    landing: clip(url.pathname, 200),
    referrer: clip(referrer ? new URL(referrer, url).hostname : undefined, 120),
  };
  if (p.get("gclid") || p.get("gbraid") || p.get("wbraid") || (utmSource === "google" && /cpc|ppc|paid/.test(utmMedium))) {
    return { src: "GA", code, at: now, ...details };
  }
  if (p.get("fbclid") || /^(facebook|instagram|meta|fb|ig)$/.test(utmSource)) {
    return { src: "FB", code, at: now, ...details };
  }
  if (/^https?:\/\/(www\.)?google\./.test(referrer)) return { src: "GS", code, at: now, ...details };
  return { src: "WEB", code, at: now, ...details };
}

/** Call once per page load (AttributionCapture). Keeps the FIRST touch for 30 days. */
export function captureFirstTouch() {
  if (typeof window === "undefined") return;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null") as Touch | null;
    const current = classify(new URL(window.location.href), document.referrer || "");
    // A paid click always replaces an older non-paid touch; otherwise first touch wins.
    const paid = current.src === "GA" || current.src === "FB";
    if (!saved || Date.now() - saved.at > TTL_MS || (paid && saved.src !== current.src) || (paid && current.code && current.code !== saved.code)) {
      localStorage.setItem(KEY, JSON.stringify(current));
    }
  } catch {
    /* storage blocked — the ref falls back to WEB */
  }
}

/** What a website booking stores about where the guest came from. */
export type BookingAttribution = {
  ref: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
  landing_path?: string;
  referrer?: string;
};

export function getBookingAttribution(): BookingAttribution | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const t = JSON.parse(localStorage.getItem(KEY) || "null") as Touch | null;
    if (!t || Date.now() - t.at > TTL_MS) return { ref: "WEB" };
    return {
      ref: t.code ? `${t.src}-${t.code}` : t.src,
      utm_source: t.utm?.source,
      utm_medium: t.utm?.medium,
      utm_campaign: t.utm?.campaign,
      utm_content: t.utm?.content,
      utm_term: t.utm?.term,
      gclid: t.gclid,
      fbclid: t.fbclid,
      landing_path: t.landing,
      referrer: t.referrer,
    };
  } catch {
    return undefined;
  }
}

/** "GA-GW1", "FB", "WEB" … */
export function getAttributionRef(): string {
  if (typeof window === "undefined") return "WEB";
  try {
    const t = JSON.parse(localStorage.getItem(KEY) || "null") as Touch | null;
    if (!t || Date.now() - t.at > TTL_MS) return "WEB";
    return t.code ? `${t.src}-${t.code}` : t.src;
  } catch {
    return "WEB";
  }
}

/** Append the ref line to a WhatsApp message (or make a message out of it). */
export function withAttributionRef(message?: string): string {
  const ref = `Ref: ${getAttributionRef()}`;
  return message ? `${message}\n\n${ref}` : `Assalam o Alaikum, I'd like to book a room.\n\n${ref}`;
}

/** Rewrite a wa.me href so its ?text= carries the ref line. */
export function addRefToWhatsAppHref(href: string): string {
  try {
    const u = new URL(href);
    if (!/(^|\.)wa\.me$/.test(u.hostname) && !u.hostname.endsWith("whatsapp.com")) return href;
    if (u.pathname.startsWith("/channel")) return href;
    const text = u.searchParams.get("text") || undefined;
    if (text && /\nRef: /.test(text)) return href;
    // encodeURIComponent (spaces → %20): WhatsApp can show "+" literally.
    u.searchParams.delete("text");
    const rest = u.searchParams.toString();
    return `${u.origin}${u.pathname}?${rest ? rest + "&" : ""}text=${encodeURIComponent(withAttributionRef(text))}`;
  } catch {
    return href;
  }
}

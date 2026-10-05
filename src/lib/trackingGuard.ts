/**
 * Keeps staff traffic out of the ad platforms.
 *
 * - /admin pages load no tracking at all (see the inline init in app/layout.tsx).
 * - Any browser that has opened /admin is flagged internal (localStorage
 *   `hss_internal=1`): GA4 still records it, tagged traffic_type=internal so a
 *   GA4 data filter can drop it, but Google Ads and Meta never see it.
 * - Visit any page with `?hss_internal=0` to clear the flag on a device.
 */
export const INTERNAL_KEY = "hss_internal";

export function onAdminPage(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/admin");
}

export function isInternalTraffic(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(INTERNAL_KEY) === "1";
  } catch {
    return false;
  }
}

/** True when ad-platform signals (Google Ads conversions, Meta Pixel) must not fire. */
export function adSignalsBlocked(): boolean {
  return onAdminPage() || isInternalTraffic();
}

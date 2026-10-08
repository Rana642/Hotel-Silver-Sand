# Tracking — Hotel Silver Sand Multan

Last updated: 2026-10-05.

## Stack (direct installs, no GTM)
- One gtag.js loader in `src/app/layout.tsx` configures Google Ads (`NEXT_PUBLIC_GOOGLE_ADS_ID`) and GA4 (`NEXT_PUBLIC_GA4_ID`).
- Meta Pixel (`NEXT_PUBLIC_META_PIXEL_ID`) is a browser install. Meta Conversions API (`src/lib/meta-capi.ts`) runs server-side, paired by event id so Meta dedupes.

## Events
| Moment | GA4 | Google Ads | Meta |
|---|---|---|---|
| Date search (hero / room search bar) | — | "Website Search" (secondary) | Search (+ CAPI, logged to `search_intents`) |
| Room selected on /reservations | begin_checkout (not a conversion) | — | InitiateCheckout |
| WhatsApp tap: contact modal, header, any wa.me link | whatsapp_click | WhatsApp Click | Contact / Schedule (modal) |
| Call tap: contact modal, any tel: link | call_click | Call Click | Contact (modal) |
| Booking submitted → /thank-you | booking_confirmed | Booking Request (value = total, enhanced conversions) | Lead + **Purchase** at submit (browser + CAPI, ids `<ref>` / `<ref>-purchase`) |

- **Meta Purchase fires at booking submit. Never move it to the admin "confirm" step.**
- Plain `wa.me` / `tel:` anchors are handled by one capture-phase listener in `src/components/AttributionCapture.tsx`:
  - It fires the Ads conversion.
  - It also fires the GA4 event, unless the anchor is a `<TrackedLink>` (`data-tracked`), which sends its own.
  - It skips `/thank-you`, `/manage-booking` and `/admin`, because those taps come from guests who have already booked.

## WhatsApp "Ref:" code
`src/lib/attribution.ts` stores the first touch for 30 days. A paid click replaces an organic touch.

| Code | Source |
|---|---|
| `GA` | gclid / gbraid / wbraid, or utm_source=google with a paid medium |
| `FB` | fbclid, or utm_source facebook / instagram / meta |
| `GS` | Google organic referrer |
| `WEB` | anything else |

- The `utm_content` value (or `utm_campaign`) is appended, e.g. `Ref: GA-GW1`.
- Every WhatsApp message from the site ends with this line, so the front desk can tell ad leads apart.
- Use short `utm_content` values in ads (e.g. `GW1`, `FBT2`).

## Staff guard
- `/admin` loads no tracking and sets `localStorage.hss_internal=1`.
- An internal browser is sent to GA4 with `traffic_type=internal`. Google Ads and the Meta Pixel are never loaded or fired for it (`src/lib/trackingGuard.ts`).
- Visit any page with `?hss_internal=0` to clear the flag.
- GA4 needs its internal-traffic data filter set to **Active** to drop this traffic.

## GA4 cleanup (UI only — the API connector is read-only)
- **Admin → Events → Key events:** un-mark `page_view`, `view_item_list`, `first_visit` and `begin_checkout`.
- **Keep as key events:** `booking_confirmed`, `whatsapp_click`, `call_click`, `directions_click`.
- **Legacy "WhatsApp Clicks" event** (157 in 30 days, the site no longer sends it):
  1. Check Admin → Events → Create event / Modify event for a rule that creates it.
  2. Remove that rule.
  3. Un-mark it as a key event.

## Booking source (2026-10-08)
- Website bookings save the same first touch as the WhatsApp Ref: `ref_code` (e.g. `FB-SFC1`), `utm_*`, `gclid`/`fbclid`, `landing_path` and `referrer` (`supabase/migration-phase17.sql`).
- Until that migration runs, `createBooking` saves the booking without these fields; a booking is never lost over them.
- The Ads by Shoaib client portal reads them, so each booking shows which ad brought it.

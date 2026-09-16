"use client";

import { useEffect } from "react";
import { trackEvent, trackMetaPixel, type EventName } from "@/lib/analytics";

/**
 * Fires a GA4 event once on mount. Used for view_item / view_item_list.
 * Optionally also fires the matching Meta Pixel standard event directly —
 * top-of-funnel data (Meta's own hospitality funnel: Search -> ViewContent
 * -> InitiateCheckout -> Purchase) that helps Meta's broader targeting even
 * when it isn't the ad set's primary optimization event.
 */
export default function ViewTracker({
  event,
  params,
  metaEvent,
  metaParams,
}: {
  event: EventName;
  params?: Record<string, unknown>;
  metaEvent?: "ViewContent";
  metaParams?: Record<string, unknown>;
}) {
  useEffect(() => {
    trackEvent(event, params);
    if (metaEvent) {
      trackMetaPixel(
        metaEvent,
        metaParams ?? {},
        typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`
      );
    }
    // fire once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

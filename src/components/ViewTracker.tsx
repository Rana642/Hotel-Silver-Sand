"use client";

import { useEffect } from "react";
import { trackEvent, type EventName } from "@/lib/analytics";

/** Fires a GTM event once on mount. Used for view_item / view_item_list. */
export default function ViewTracker({ event, params }: { event: EventName; params?: Record<string, unknown> }) {
  useEffect(() => {
    trackEvent(event, params);
    // fire once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

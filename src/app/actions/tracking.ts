"use server";

import { createServiceClient } from "@/lib/supabase/service";
import { sendMetaEvent } from "@/lib/meta-capi";

export type SearchIntentInput = {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  roomSlug?: string;
  value: number;
  pageUrl?: string;
  /** Shared with the browser Pixel's fbq call so Meta dedupes the two signals. */
  metaEventId: string;
};

/**
 * Fired alongside the browser Pixel "Search" event: logs the search for
 * /admin visibility and sends the paired server-side CAPI event. Search is
 * now the optimization event for both Meta ad sets, so its match quality
 * (fbp/fbc/IP/user-agent, read automatically inside sendMetaEvent) matters
 * more than any other event on the site — this closes the one event that
 * was still Pixel-only.
 */
export async function trackSearchServer(input: SearchIntentInput): Promise<void> {
  const nights = Math.max(1, Math.round((+new Date(input.checkOut) - +new Date(input.checkIn)) / 86400000));

  const supabase = createServiceClient();
  await supabase.from("search_intents").insert({
    check_in: input.checkIn,
    check_out: input.checkOut,
    nights,
    adults: input.adults,
    children: input.children,
    rooms: input.rooms,
    room_slug: input.roomSlug ?? null,
    value: input.value,
    page_url: input.pageUrl ?? null,
    meta_event_id: input.metaEventId,
  });

  await sendMetaEvent({
    name: "Search",
    eventId: input.metaEventId,
    eventSourceUrl: input.pageUrl,
    custom: {
      currency: "PKR",
      value: input.value,
      content_name: input.roomSlug,
    },
  });
}

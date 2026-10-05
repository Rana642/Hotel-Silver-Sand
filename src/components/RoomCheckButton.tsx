"use client";

import { CalendarCheck } from "lucide-react";
import { useBooking } from "@/components/BookingProvider";

/** Room card CTA: opens the dates popup for this room, which lands on
 *  /reservations with the room listed first — one step instead of three. */
export default function RoomCheckButton({ slug, name, className = "" }: { slug: string; name: string; className?: string }) {
  const booking = useBooking();
  return (
    <button type="button" onClick={() => booking.openReservation({ slug, name })} className={className}>
      <CalendarCheck className="size-4" /> Check Availability
    </button>
  );
}

"use client";

import { ExternalLink } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export default function BookingComLink({
  href,
  roomName,
  className = "",
}: {
  href: string;
  roomName: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent("bookingcom_click", { location: "room_card", room: roomName })}
      className={className}
    >
      Also on Booking.com <ExternalLink className="inline size-3" />
    </a>
  );
}

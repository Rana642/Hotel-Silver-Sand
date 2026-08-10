"use client";

import { Button } from "@/components/Button";
import { useBooking } from "@/components/BookingProvider";
import type { ReactNode } from "react";

type Variant = "gold" | "navy" | "outline" | "outline-light" | "whatsapp";

export default function BookNowButton({
  children = "Book Now",
  room,
  variant = "gold",
  className = "",
}: {
  children?: ReactNode;
  room?: string;
  variant?: Variant;
  className?: string;
}) {
  const booking = useBooking();
  return (
    <Button variant={variant} className={className} onClick={() => booking.open(room)}>
      {children}
    </Button>
  );
}

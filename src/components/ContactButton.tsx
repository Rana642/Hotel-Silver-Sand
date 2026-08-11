"use client";

import { useBooking } from "@/components/BookingProvider";
import { buttonClasses, type Variant } from "@/components/Button";
import type { ContactMode } from "@/components/PreContactModal";

/**
 * A button that opens the pre-contact "Quick details" modal before Call/WhatsApp.
 * Pass `variant` to match the shared Button styles, or `className` for full control.
 */
export default function ContactButton({
  mode,
  variant,
  className,
  children,
}: {
  mode: ContactMode;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  const { openContact } = useBooking();
  const cls = variant ? buttonClasses(variant, className) : className;
  return (
    <button type="button" onClick={() => openContact(mode)} className={cls}>
      {children}
    </button>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import PreContactModal, { type ContactMode } from "@/components/PreContactModal";
import ReservationModal from "@/components/ReservationModal";
import { tel, waLink } from "@/data/site";
import { trackEvent, trackAdsConversion } from "@/lib/analytics";

/**
 * Pre-contact "Quick details" lead form on Call/WhatsApp.
 * Deactivated for now — Call/WhatsApp act directly. Flip to `true` to bring the
 * lead-capture form back (nothing else needs to change).
 */
const CONTACT_FORM_ENABLED = false;

type BookingContextValue = {
  openContact: (mode: ContactMode) => void;
  openReservation: () => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}

export default function BookingProvider({ children }: { children: ReactNode }) {
  const [contactMode, setContactMode] = useState<ContactMode | null>(null);
  const [reservationOpen, setReservationOpen] = useState(false);

  const openContact = useCallback((mode: ContactMode) => {
    if (CONTACT_FORM_ENABLED) {
      setContactMode(mode);
      return;
    }
    // Direct action — no form.
    const isCall = mode === "call";
    trackEvent(isCall ? "call_click" : "whatsapp_click", { location: "direct" });
    trackAdsConversion(
      isCall
        ? process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_CALL
        : process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_WHATSAPP
    );
    if (isCall) window.location.href = tel;
    else window.open(waLink(), "_blank", "noopener");
  }, []);

  const openReservation = useCallback(() => setReservationOpen(true), []);

  const value = useMemo(() => ({ openContact, openReservation }), [openContact, openReservation]);

  return (
    <BookingContext.Provider value={value}>
      {children}
      {CONTACT_FORM_ENABLED && contactMode && (
        <PreContactModal mode={contactMode} onClose={() => setContactMode(null)} />
      )}
      {reservationOpen && <ReservationModal onClose={() => setReservationOpen(false)} />}
    </BookingContext.Provider>
  );
}

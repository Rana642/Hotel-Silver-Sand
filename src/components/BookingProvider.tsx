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

type BookingContextValue = {
  openContact: (mode: ContactMode) => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}

export default function BookingProvider({ children }: { children: ReactNode }) {
  const [contactMode, setContactMode] = useState<ContactMode | null>(null);
  const openContact = useCallback((mode: ContactMode) => setContactMode(mode), []);
  const value = useMemo(() => ({ openContact }), [openContact]);

  return (
    <BookingContext.Provider value={value}>
      {children}
      {contactMode && <PreContactModal mode={contactMode} onClose={() => setContactMode(null)} />}
    </BookingContext.Provider>
  );
}

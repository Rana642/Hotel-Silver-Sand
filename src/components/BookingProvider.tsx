"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import BookingModal from "@/components/BookingModal";
import PreContactModal, { type ContactMode } from "@/components/PreContactModal";

export type BookingPrefill = {
  room?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
};

type BookingContextValue = {
  open: (prefill?: string | BookingPrefill) => void;
  close: () => void;
  openContact: (mode: ContactMode) => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}

export default function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prefill, setPrefill] = useState<BookingPrefill>({});
  const [contactMode, setContactMode] = useState<ContactMode | null>(null);

  const open = useCallback((arg?: string | BookingPrefill) => {
    setPrefill(typeof arg === "string" ? { room: arg } : arg ?? {});
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);
  const openContact = useCallback((mode: ContactMode) => setContactMode(mode), []);

  const value = useMemo(() => ({ open, close, openContact }), [open, close, openContact]);

  return (
    <BookingContext.Provider value={value}>
      {children}
      {isOpen && <BookingModal onClose={close} prefill={prefill} />}
      {contactMode && <PreContactModal mode={contactMode} onClose={() => setContactMode(null)} />}
    </BookingContext.Provider>
  );
}

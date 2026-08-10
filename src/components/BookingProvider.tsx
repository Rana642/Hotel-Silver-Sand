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

type BookingContextValue = {
  open: (roomName?: string) => void;
  close: () => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}

export default function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [room, setRoom] = useState<string | undefined>(undefined);

  const open = useCallback((roomName?: string) => {
    setRoom(roomName);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <BookingContext.Provider value={value}>
      {children}
      {isOpen && <BookingModal onClose={close} presetRoom={room} />}
    </BookingContext.Provider>
  );
}

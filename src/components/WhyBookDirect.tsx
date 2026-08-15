"use client";

import { useEffect, useRef, useState } from "react";
import { Wallet, BadgePercent, Wifi, Car, Clock, ShieldCheck, Users, Info, X } from "lucide-react";

const points = [
  { icon: Wallet, text: "Book now & pay at the hotel — no advance payment" },
  { icon: BadgePercent, text: "Best price guaranteed when you book direct" },
  { icon: Wifi, text: "Free high-speed WiFi in all areas" },
  { icon: Car, text: "Free on-site parking" },
  { icon: ShieldCheck, text: "24/7 CCTV security & round-the-clock front desk" },
  { icon: Clock, text: "24-hour check-in — arrive any time" },
  { icon: Users, text: "Family-friendly rooms in the heart of Multan Cantt" },
];

export default function WhyBookDirect() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs font-semibold text-navy underline decoration-gold/60 underline-offset-2 hover:text-gold"
      >
        <Info className="size-3.5" /> Why Book Direct?
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-[min(88vw,340px)] rounded-xl border border-gray-100 bg-white p-4 text-left shadow-pop">
          <div className="flex items-center justify-between">
            <p className="font-heading text-sm font-bold text-navy">Why Book Direct?</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-gray-400 hover:text-navy">
              <X className="size-4" />
            </button>
          </div>
          <ul className="mt-3 space-y-2.5">
            {points.map((p) => (
              <li key={p.text} className="flex items-start gap-2.5 text-sm text-slate">
                <p.icon className="mt-0.5 size-4 shrink-0 text-gold" />
                {p.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

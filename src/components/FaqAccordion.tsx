"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Faq } from "@/data/hotel-facts";

export default function FaqAccordion({ items, openFirst = true }: { items: Faq[]; openFirst?: boolean }) {
  const [open, setOpen] = useState<number | null>(openFirst ? 0 : null);

  return (
    <div className="divide-y divide-gray-200 border-y border-gray-200">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-start justify-between gap-4 py-4 text-left transition hover:text-gold"
              >
                <span className="font-heading text-base font-semibold text-navy sm:text-lg">{f.q}</span>
                <ChevronDown
                  className={`mt-0.5 size-5 shrink-0 text-gold transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
            </h3>
            <div hidden={!isOpen}>
              <p className="pb-5 pr-9 leading-relaxed text-slate">{f.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

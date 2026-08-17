"use client";

import { useEffect, useRef, useState } from "react";
import { Users, Minus, Plus } from "lucide-react";

export type Occupancy = { adults: number; children: number; rooms: number };

function summarize(o: Occupancy, showRooms: boolean) {
  const parts = [
    `${o.adults} adult${o.adults === 1 ? "" : "s"}`,
    `${o.children} ${o.children === 1 ? "child" : "children"}`,
  ];
  if (showRooms) parts.push(`${o.rooms} room${o.rooms === 1 ? "" : "s"}`);
  return parts.join(" · ");
}

function Stepper({
  label,
  hint,
  value,
  min,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <p className="text-sm font-semibold text-navy">{label}</p>
        {hint && <p className="text-xs text-slate">{hint}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Fewer ${label}`}
          className="flex size-8 items-center justify-center rounded-full border border-gray-300 text-navy transition hover:border-gold hover:text-gold disabled:opacity-30"
        >
          <Minus className="size-4" />
        </button>
        <span className="w-5 text-center text-sm font-semibold text-navy">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          aria-label={`More ${label}`}
          className="flex size-8 items-center justify-center rounded-full border border-gray-300 text-navy transition hover:border-gold hover:text-gold"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}

export default function OccupancyPicker({
  value,
  onChange,
  showRooms = true,
  label = "Select Occupancy",
  className = "",
}: {
  value: Occupancy;
  onChange: (v: Occupancy) => void;
  showRooms?: boolean;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-left transition hover:border-gold focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
      >
        <Users className="size-5 shrink-0 text-gold" />
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold text-slate">{label}</span>
          <span className="block truncate text-sm font-semibold text-navy">{summarize(value, showRooms)}</span>
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[280px] rounded-lg border border-gray-200 bg-white p-4 shadow-pop">
          <div className="divide-y divide-gray-100">
            <Stepper label="Adults" value={value.adults} min={1} onChange={(v) => onChange({ ...value, adults: v })} />
            <Stepper
              label="Children"
              hint="Ages 0–12"
              value={value.children}
              min={0}
              onChange={(v) => onChange({ ...value, children: v })}
            />
            {showRooms && (
              <Stepper label="Rooms" value={value.rooms} min={1} onChange={(v) => onChange({ ...value, rooms: v })} />
            )}
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-3 w-full rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-dark"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

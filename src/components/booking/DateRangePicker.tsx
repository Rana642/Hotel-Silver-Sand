"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function parse(s: string) {
  return new Date(s + "T00:00:00");
}
function fmt(s: string) {
  return parse(s).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
function firstOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
/** Leading blanks + day date-strings for a month grid (Sun-first). */
function monthCells(base: Date): (string | null)[] {
  const year = base.getFullYear();
  const month = base.getMonth();
  const pad = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = Array(pad).fill(null);
  for (let d = 1; d <= days; d++) cells.push(ymd(new Date(year, month, d)));
  return cells;
}

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DateRangePicker({
  checkIn,
  checkOut,
  min,
  onChange,
  label = "Select Date",
  className = "",
  variant = "solid",
}: {
  checkIn: string;
  checkOut: string;
  min?: string; // earliest selectable YYYY-MM-DD (default today)
  onChange: (checkIn: string, checkOut: string) => void;
  label?: string;
  className?: string;
  variant?: "solid" | "glass";
}) {
  const glass = variant === "glass";
  const today = ymd(new Date());
  const minDate = min || today;
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => firstOfMonth(parse(checkIn || minDate)));
  const [hover, setHover] = useState<string | null>(null);
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

  function pick(date: string) {
    if (date < minDate) return;
    // Start a fresh range unless we're mid-selection (in set, out empty).
    if (!checkIn || checkOut || date <= checkIn) {
      onChange(date, "");
      setHover(null);
    } else {
      onChange(checkIn, date);
      setOpen(false);
    }
  }

  const nights =
    checkIn && checkOut ? Math.max(0, Math.round((+parse(checkOut) - +parse(checkIn)) / 86400000)) : 0;

  // For in-progress hover preview of the range end.
  const rangeEnd = checkOut || (checkIn && hover && hover > checkIn ? hover : "");

  function inRange(d: string) {
    if (!checkIn || !rangeEnd) return false;
    return d > checkIn && d < rangeEnd;
  }

  const value =
    checkIn && checkOut
      ? `${fmt(checkIn)} — ${fmt(checkOut)}`
      : checkIn
        ? `${fmt(checkIn)} — Add checkout`
        : "Add dates";

  const prevDisabled = firstOfMonth(cursor) <= firstOfMonth(parse(minDate));

  function Month({ base }: { base: Date }) {
    return (
      <div className="w-full">
        <p className="mb-2 text-center font-heading text-sm font-bold text-navy">
          {base.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
        <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-slate">
          {WD.map((w) => (
            <div key={w} className="py-1">{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-0.5">
          {monthCells(base).map((d, i) => {
            if (!d) return <div key={i} />;
            const disabled = d < minDate;
            const isIn = d === checkIn;
            const isOut = d === checkOut;
            const isEdge = isIn || isOut;
            const between = inRange(d);
            return (
              <button
                key={d}
                type="button"
                disabled={disabled}
                onMouseEnter={() => setHover(d)}
                onClick={() => pick(d)}
                className={`relative mx-auto flex size-8 items-center justify-center text-sm transition ${
                  between ? "bg-gold/20" : ""
                } ${isIn ? "rounded-l-full" : ""} ${isOut ? "rounded-r-full" : ""} ${
                  isEdge
                    ? "rounded-full bg-gold font-bold text-navy-dark"
                    : disabled
                      ? "cursor-not-allowed text-gray-300"
                      : "rounded-full text-navy hover:bg-cream"
                }`}
              >
                {Number(d.slice(-2))}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex min-h-[52px] w-full items-center gap-2 rounded-md border px-3 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-gold/40 ${
          glass ? "border-white/25 bg-white/10 backdrop-blur-md hover:border-gold" : "border-gray-300 bg-white hover:border-gold focus:border-gold"
        }`}
      >
        <CalendarDays className="size-5 shrink-0 text-gold" />
        <span className="min-w-0 flex-1">
          <span className={`block text-[11px] font-semibold ${glass ? "text-white/70" : "text-slate"}`}>{label}</span>
          <span className={`block truncate text-sm font-semibold ${checkIn ? (glass ? "text-white" : "text-navy") : glass ? "text-white/50" : "text-gray-400"}`}>{value}</span>
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[300px] rounded-lg border border-gray-200 bg-white p-4 shadow-pop sm:w-[560px]">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCursor((c) => addMonths(c, -1))}
              disabled={prevDisabled}
              aria-label="Previous month"
              className="rounded p-1 text-navy hover:bg-cream disabled:opacity-30"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => setCursor((c) => addMonths(c, 1))}
              aria-label="Next month"
              className="rounded p-1 text-navy hover:bg-cream"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
          <div className="mt-1 grid gap-6 sm:grid-cols-2">
            <Month base={cursor} />
            <div className="hidden sm:block">
              <Month base={addMonths(cursor, 1)} />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
            <p className="text-xs text-slate">
              {nights > 0 ? `${nights} night${nights > 1 ? "s" : ""} selected` : "Pick your check-in & check-out"}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md bg-navy px-4 py-1.5 text-xs font-semibold text-white hover:bg-navy-dark"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

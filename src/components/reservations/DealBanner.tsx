"use client";

import { useEffect, useState } from "react";
import { Flame, Clock, Tag } from "lucide-react";
import type { BannerDeal } from "@/lib/deals";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toSec(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 3600 + m * 60;
}
/** Current seconds-since-midnight in Pakistan time (UTC+5), from the viewer's clock. */
function pktNowSec() {
  const utcMs = Date.now() + new Date().getTimezoneOffset() * 60000;
  const p = new Date(utcMs + 5 * 3600000);
  return p.getHours() * 3600 + p.getMinutes() * 60 + p.getSeconds();
}
function fmtCountdown(sec: number) {
  const s = Math.max(0, sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}h ${pad(m)}m ${pad(ss)}s` : `${pad(m)}m ${pad(ss)}s`;
}

export default function DealBanner({ deal }: { deal: BannerDeal }) {
  const hasWindow = !!deal.startTime && !!deal.endTime;
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!hasWindow) return;
    setNow(pktNowSec());
    const t = setInterval(() => setNow(pktNowSec()), 1000);
    return () => clearInterval(t);
  }, [hasWindow]);

  // The banner exists for the countdown — without active hours there's nothing to count down.
  if (!hasWindow) return null;

  // Timer state
  let timer: { active: boolean; label: string; value: string } | null = null;
  if (hasWindow && now !== null) {
    const start = toSec(deal.startTime!);
    const end = toSec(deal.endTime!);
    const overnight = start > end;
    const active = overnight ? now >= start || now <= end : now >= start && now <= end;
    if (active) {
      const secsToEnd = overnight ? (now >= start ? end + 86400 - now : end - now) : end - now;
      timer = { active: true, label: "Hurry! Offer ends in", value: fmtCountdown(secsToEnd) };
    } else {
      const secsToStart = (start - now + 86400) % 86400;
      timer = { active: false, label: "Offer opens in", value: fmtCountdown(secsToStart) };
    }
  }

  const days = deal.weekdays.length > 0 ? deal.weekdays.slice().sort().map((d) => DAY_NAMES[d]).join(", ") : null;

  return (
    <div className="overflow-hidden rounded-lg border border-gold/40 bg-gradient-to-r from-navy-dark to-navy p-4 text-white shadow-pop sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-heading text-lg font-bold">
            <Flame className="size-5 text-gold" /> {deal.name}
            <span className="rounded bg-gold px-2 py-0.5 text-sm font-bold text-navy-dark">Save {deal.discountPct}%</span>
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/85">
            {days && <span className="flex items-center gap-1.5"><Tag className="size-4 text-gold" /> {days} only</span>}
            <span className="flex items-center gap-1.5"><Clock className="size-4 text-gold" /> {deal.startTime}–{deal.endTime} (PKT)</span>
          </div>
        </div>

        {timer && (
          <div className={`shrink-0 rounded-md px-4 py-2 text-center ${timer.active ? "bg-gold text-navy-dark" : "bg-white/10 text-white"}`}>
            <p className="text-[11px] font-semibold uppercase tracking-wide opacity-90">{timer.label}</p>
            <p className="font-heading text-xl font-bold tabular-nums">{timer.value}</p>
          </div>
        )}
      </div>
    </div>
  );
}

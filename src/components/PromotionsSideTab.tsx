"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gift, ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";

type Promo = { slug: string; title: string; short_desc: string | null; badge: string | null };

export default function PromotionsSideTab() {
  const pathname = usePathname();
  const [promos, setPromos] = useState<Promo[]>([]);
  const [open, setOpen] = useState(true);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/promotions")
      .then((r) => r.json())
      .then((d: Promo[]) => alive && setPromos(Array.isArray(d) ? d : []))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    if (!open || paused || promos.length < 2) return;
    timer.current = setInterval(() => setI((p) => (p + 1) % promos.length), 5000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [open, paused, promos.length]);

  // Don't show on the promotions pages themselves, or the thank-you page.
  if (!promos.length || pathname?.startsWith("/promotions") || pathname?.startsWith("/thank-you")) {
    return null;
  }

  const promo = promos[i % promos.length];
  const prev = () => setI((p) => (p - 1 + promos.length) % promos.length);
  const next = () => setI((p) => (p + 1) % promos.length);

  return (
    <div className="fixed left-0 top-28 z-40 hidden items-stretch lg:flex print:hidden">
      {/* Left strip / tab */}
      <div className="flex w-9 flex-col items-center bg-navy text-gold">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Hide promotions" : "Show promotions"}
          className="flex w-full items-center justify-center py-2 hover:bg-navy-dark"
        >
          {open ? <X className="size-4" /> : <ChevronRight className="size-4" />}
        </button>
        <div className="flex flex-1 flex-col items-center gap-2 py-3">
          <Gift className="size-4" />
          <span className="text-xs font-semibold tracking-wider [writing-mode:vertical-rl]">
            Promotions
          </span>
        </div>
      </div>

      {/* Panel */}
      {open && promo && (
        <div className="w-72 border-l border-gold/30 bg-navy/95 p-4 text-white shadow-pop backdrop-blur-sm">
          {promo.badge && (
            <span className="inline-block bg-gold px-2 py-0.5 text-xs font-bold text-navy-dark">
              {promo.badge}
            </span>
          )}
          <h3 className="mt-2 font-heading text-lg font-bold">{promo.title}</h3>
          {promo.short_desc && <p className="mt-1 text-sm leading-relaxed text-white/85">{promo.short_desc}</p>}

          <div className="mt-3 flex items-center gap-1">
            <button onClick={prev} aria-label="Previous" className="p-1 text-white/80 hover:text-gold">
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Play" : "Pause"}
              className="p-1 text-white/80 hover:text-gold"
            >
              {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
            </button>
            <button onClick={next} aria-label="Next" className="p-1 text-white/80 hover:text-gold">
              <ChevronRight className="size-4" />
            </button>
            <span className="ml-auto text-xs text-white/60">
              {i + 1} / {promos.length}
            </span>
          </div>

          <Link
            href={`/promotions/${promo.slug}`}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gold underline decoration-gold/50 underline-offset-2 hover:text-white"
          >
            More info <ChevronRight className="size-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { HeroImage } from "@/lib/hero";

export default function HeroSlider({ images }: { images: HeroImage[] }) {
  // Only the slide on show, the next one (so it is ready) and the ones already shown are loaded. Every slide used to
  // load on every home page view, even the hidden ones, which multiplied image requests on the hotel's Vercel plan.
  const [{ i, seen }, setShow] = useState<{ i: number; seen: number[] }>({ i: 0, seen: [0] });
  const goTo = (n: number) => setShow((s) => ({ i: n, seen: s.seen.includes(n) ? s.seen : [...s.seen, n] }));

  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(
      () => setShow((s) => { const n = (s.i + 1) % images.length; return { i: n, seen: s.seen.includes(n) ? s.seen : [...s.seen, n] }; }),
      5000
    );
    return () => clearInterval(t);
  }, [images.length]);

  const next = images.length > 1 ? (i + 1) % images.length : -1;

  return (
    <>
      {images.map((img, idx) => (idx === i || idx === next || seen.includes(idx) ? (
        <Image
          key={img.id}
          src={img.url}
          alt={img.alt ?? "Hotel Silver Sand Multan"}
          fill
          priority={idx === 0}
          sizes="100vw"
          className={`object-cover object-center transition-opacity duration-[1200ms] ${
            idx === i ? "opacity-100" : "opacity-0"
          }`}
          style={idx === i ? { animation: "heroZoom 6s ease-out forwards" } : undefined}
        />
      ) : null))}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/45 via-transparent to-transparent" />

      {images.length > 1 && (
        <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center">
          {images.map((_, idx) => (
            /* The dot is 8 px, but the button around it is a full thumb-sized
               target — a 8 px tap area is unusable on a phone. */
            <button
              key={idx}
              type="button"
              onClick={() => goTo(idx)}
              aria-label={`Show slide ${idx + 1}`}
              aria-current={idx === i}
              className="group flex h-11 w-8 items-center justify-center"
            >
              <span
                className={`h-2 rounded-full transition-all ${
                  idx === i ? "w-6 bg-gold" : "w-2 bg-white/60 group-hover:bg-white/90"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { HeroImage } from "@/lib/hero";

export default function HeroSlider({ images }: { images: HeroImage[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => setI((p) => (p + 1) % images.length), 5000);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <>
      {images.map((img, idx) => (
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
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/45 via-transparent to-transparent" />

      {images.length > 1 && (
        <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center">
          {images.map((_, idx) => (
            /* The dot is 8 px, but the button around it is a full thumb-sized
               target — a 8 px tap area is unusable on a phone. */
            <button
              key={idx}
              type="button"
              onClick={() => setI(idx)}
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

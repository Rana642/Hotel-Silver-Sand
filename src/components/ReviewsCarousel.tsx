"use client";

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { reviews } from "@/data/reviews";

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-4 ${i < n ? "fill-gold text-gold" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsCarousel() {
  const [start, setStart] = useState(0);
  const perView = 3;
  const maxStart = Math.max(0, reviews.length - perView);

  const prev = () => setStart((s) => Math.max(0, s - 1));
  const next = () => setStart((s) => Math.min(maxStart, s + 1));

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-card sm:p-8">
      {/* Mobile: horizontal scroll */}
      <div className="flex snap-x gap-4 overflow-x-auto pb-2 lg:hidden">
        {reviews.map((r) => (
          <ReviewCard key={r.name} review={r} className="w-[80%] shrink-0 snap-start" />
        ))}
      </div>

      {/* Desktop: paged */}
      <div className="hidden grid-cols-3 gap-5 lg:grid">
        {reviews.slice(start, start + perView).map((r) => (
          <ReviewCard key={r.name} review={r} />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={prev}
          disabled={start === 0}
          aria-label="Previous reviews"
          className="flex size-10 items-center justify-center rounded-full bg-navy text-white transition hover:bg-navy-dark disabled:opacity-30 max-lg:hidden"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={next}
          disabled={start === maxStart}
          aria-label="Next reviews"
          className="flex size-10 items-center justify-center rounded-full bg-navy text-white transition hover:bg-navy-dark disabled:opacity-30 max-lg:hidden"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  className = "",
}: {
  review: (typeof reviews)[number];
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-gray-100 bg-cream/40 p-5 ${className}`}>
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
          {review.initial}
        </span>
        <div>
          <p className="text-sm font-semibold text-navy">{review.name}</p>
          <p className="text-xs text-slate">{review.when}</p>
        </div>
      </div>
      <div className="mt-3">
        <Stars n={review.rating} />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate">{review.text}</p>
      <p className="mt-3 text-xs font-semibold text-navy/50">Google Review</p>
    </div>
  );
}

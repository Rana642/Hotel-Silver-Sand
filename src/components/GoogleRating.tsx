import { Star } from "lucide-react";
import { googleRating } from "@/data/hotel-facts";
import { site } from "@/data/site";

/**
 * The real Google Business Profile score, linked to Google so a visitor can
 * check it. Never render a rating that isn't verifiable at that link.
 */
export default function GoogleRating({
  variant = "light",
  size = "md",
}: {
  /** "light" = on a dark background (hero); "dark" = on a light background. */
  variant?: "light" | "dark";
  size?: "sm" | "md";
}) {
  const { value, count, scale } = googleRating;
  const light = variant === "light";
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.25;

  return (
    <a
      href={site.googleBusinessUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 transition hover:opacity-90 ${
        size === "sm" ? "text-xs" : "text-sm"
      } ${light ? "text-white" : "text-navy"}`}
    >
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: scale }, (_, i) => (
          <Star
            key={i}
            className={`${size === "sm" ? "size-3.5" : "size-4"} ${
              i < full || (i === full && hasHalf)
                ? "fill-gold text-gold"
                : light
                  ? "text-white/35"
                  : "text-gray-300"
            }`}
          />
        ))}
      </span>
      <span className="font-semibold">{value.toFixed(1)}</span>
      <span className={light ? "text-white/80" : "text-slate"}>
        from {count.toLocaleString("en-PK")} Google reviews
      </span>
    </a>
  );
}

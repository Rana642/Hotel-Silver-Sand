import type { Amenity } from "@/data/amenities";

export default function AmenityCard({
  amenity,
  variant = "light",
}: {
  amenity: Amenity;
  variant?: "light" | "dark";
}) {
  const { icon: Icon, title, description } = amenity;
  const dark = variant === "dark";
  return (
    <div
      className={`rounded-lg border p-6 transition ${
        dark
          ? "border-white/10 bg-white/5 hover:bg-white/10"
          : "border-gray-100 bg-white shadow-card hover:shadow-pop"
      }`}
    >
      <Icon className="size-8 text-gold" />
      <h3
        className={`mt-4 font-heading text-lg font-bold ${dark ? "text-white" : "text-navy"}`}
      >
        {title}
      </h3>
      {description && (
        <p className={`mt-2 text-sm leading-relaxed ${dark ? "text-white/70" : "text-slate"}`}>
          {description}
        </p>
      )}
    </div>
  );
}

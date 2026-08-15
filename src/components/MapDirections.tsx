"use client";

import { useState } from "react";
import { Navigation } from "lucide-react";
import { site } from "@/data/site";
import { trackEvent } from "@/lib/analytics";

const destinations = [
  "Multan International Airport",
  "Multan Cantt Railway Station",
  "Multan Railway Station",
  "Ghanta Ghar (City Centre), Multan",
  "Shah Rukn-e-Alam Shrine, Multan",
  "Nishtar Hospital, Multan",
  "Multan Cricket Stadium",
];

export default function MapDirections() {
  const [to, setTo] = useState(destinations[0]);

  function go() {
    trackEvent("directions_click", { location: "contact_directions", destination: to });
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      site.mapQuery
    )}&destination=${encodeURIComponent(to)}`;
    window.open(url, "_blank", "noopener");
  }

  const cell = "w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40";

  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-slate">From</span>
        <input value={site.name} disabled className={cell + " cursor-not-allowed bg-cream text-slate"} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-slate">To</span>
        <select value={to} onChange={(e) => setTo(e.target.value)} className={cell}>
          {destinations.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={go}
        className="mt-auto flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-dark"
      >
        <Navigation className="size-4" /> Get Directions
      </button>
    </div>
  );
}

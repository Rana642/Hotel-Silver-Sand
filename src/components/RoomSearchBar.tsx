"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import DateRangePicker from "@/components/booking/DateRangePicker";
import OccupancyPicker, { type Occupancy } from "@/components/booking/OccupancyPicker";
import { saveIntent } from "@/lib/bookingIntent";
import { trackMetaPixel } from "@/lib/analytics";
import { useMinRate } from "@/lib/useMinRate";

function localDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function RoomSearchBar() {
  const router = useRouter();
  const today = localDate(0);
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(localDate(1));
  const [occ, setOcc] = useState<Occupancy>({ adults: 1, children: 0, rooms: 1 });
  const startingFrom = useMinRate();

  function search() {
    saveIntent({
      checkIn,
      checkOut,
      guests: String(occ.adults + occ.children),
      adults: occ.adults,
      children: occ.children,
      rooms: occ.rooms,
    });
    const nights = Math.max(1, Math.round((+new Date(checkOut) - +new Date(checkIn)) / 86400000));
    trackMetaPixel(
      "Search",
      { content_category: "hotel_room", value: startingFrom * nights * occ.rooms, currency: "PKR" },
      typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`
    );
    const q = new URLSearchParams({
      checkIn,
      checkOut,
      adults: String(occ.adults),
      children: String(occ.children),
      rooms: String(occ.rooms),
    });
    router.push(`/reservations?${q.toString()}`);
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1.6fr_1.3fr_auto]">
      <DateRangePicker checkIn={checkIn} checkOut={checkOut} min={today} onChange={(ci, co) => { setCheckIn(ci); setCheckOut(co); }} />
      <OccupancyPicker value={occ} onChange={setOcc} />
      <button
        type="button"
        onClick={search}
        className="mt-auto flex items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-navy-dark transition hover:brightness-95"
      >
        <Search className="size-4" /> Search
      </button>
    </div>
  );
}

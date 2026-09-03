import type { Metadata } from "next";
import ReservationsFlow, { type RoomVM } from "@/components/reservations/ReservationsFlow";
import { getRoomsStatic, roomPricing } from "@/lib/rooms";
import { availabilityForStay, pktToday, addDays } from "@/lib/availability";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: "Book Your Stay — Hotel Silver Sand Multan",
  description:
    "Check availability and book your room at Hotel Silver Sand Multan. Best direct rates, pay at hotel, free WiFi & parking. Instant WhatsApp confirmation.",
  path: "/reservations",
  absoluteTitle: true,
});

const BED: Record<string, string> = {
  "deluxe-king-room": "King Bed",
  "deluxe-triple-room": "3 Single Beds",
  "executive-twin-room": "Twin Beds",
  "executive-family-room": "Double + Twin Beds",
};

function nightsBetween(a: string, b: string) {
  return Math.max(1, Math.round((+new Date(b + "T00:00:00Z") - +new Date(a + "T00:00:00Z")) / 86400000));
}
function isYmd(s?: string) {
  return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const today = pktToday();
  const checkIn = isYmd(sp.checkIn) && sp.checkIn! >= today ? sp.checkIn! : today;
  const checkOut = isYmd(sp.checkOut) && sp.checkOut! > checkIn ? sp.checkOut! : addDays(checkIn, 1);
  const adults = Math.max(1, Number(sp.adults) || 1);
  const children = Math.max(0, Number(sp.children) || 0);
  const roomsWanted = Math.max(1, Number(sp.rooms) || 1);
  const promo = sp.promo?.trim() || "";
  const nights = nightsBetween(checkIn, checkOut);

  const [dbRooms, avail] = await Promise.all([getRoomsStatic(), availabilityForStay(checkIn, nights)]);

  const rooms: RoomVM[] = dbRooms.map((r) => {
    const p = roomPricing(r);
    return {
      id: r.id,
      slug: r.slug,
      name: r.name,
      capacity: r.capacity ?? `${r.max_adults} Adults`,
      maxAdults: r.max_adults,
      maxChildren: r.max_children,
      bed: BED[r.slug] ?? "Comfortable Bedding",
      description: r.description ?? "",
      amenities: r.amenities ?? [],
      images: (r.room_images ?? []).map((i) => i.url).slice(0, 8),
      price: p.price,
      original: p.original,
      discountPct: p.discountPct,
      gstPercent: Number(r.gst_percent) || 0,
      unitsLeft: avail[r.id] ?? 0,
    };
  });

  return (
    <ReservationsFlow
      rooms={rooms}
      initial={{ checkIn, checkOut, adults, children, rooms: roomsWanted, promo }}
      today={today}
      nights={nights}
    />
  );
}

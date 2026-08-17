import Image from "next/image";
import Link from "next/link";
import { Users, ArrowRight, BadgePercent } from "lucide-react";
import type { Room } from "@/data/rooms";
import { bookingComLink } from "@/data/site";
import BookingComLink from "@/components/BookingComLink";

const shortLabel: Record<string, string> = {
  "Air Conditioning": "AC",
  "High-Speed WiFi": "Free WiFi",
  "Mini Fridge": "Mini Fridge",
  "Smart/Flat-screen TV": "Smart TV",
  "Attached Private Bathroom": "Private Bath",
  "Room Service": "Room Service",
};

function fmt(n: number) {
  return "PKR " + n.toLocaleString("en-US");
}

export default function RoomCard({ room }: { room: Room }) {
  const bookingComHref = room.bookingUrl || bookingComLink(`room_card_${room.slug}`);
  const pct =
    room.originalPrice && room.originalPrice > room.price
      ? Math.round(((room.originalPrice - room.price) / room.originalPrice) * 100)
      : 0;
  const chips = room.features.slice(0, 4).map((f) => shortLabel[f] ?? f);

  return (
    <article className="flex h-full flex-col overflow-hidden border border-gray-100 bg-white shadow-card transition hover:shadow-pop">
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={room.image}
          alt={room.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {pct > 0 && (
          <span className="absolute left-0 top-3 flex items-center gap-1 bg-gold px-2.5 py-1 text-xs font-bold text-navy-dark">
            <BadgePercent className="size-3.5" /> Save {pct}%
          </span>
        )}
        {room.available && (
          <span className="absolute right-3 top-3 flex items-center gap-1 bg-white/90 px-2.5 py-1 text-xs font-semibold text-green-600">
            <span className="size-1.5 rounded-full bg-green-500" /> Available
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="min-h-[3.25rem] font-heading text-lg font-bold leading-snug text-navy">
          {room.name}
        </h3>
        <span className="mt-1 inline-flex w-fit items-center gap-1.5 text-sm text-slate">
          <Users className="size-4 text-gold" /> {room.capacity}
        </span>

        {/* Amenity chips */}
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <li key={c} className="border border-gray-200 px-2 py-0.5 text-xs text-slate">
              {c}
            </li>
          ))}
        </ul>

        {/* Footer pinned to the bottom so prices + CTAs align across cards */}
        <div className="mt-auto pt-5">
          <div className="border-t border-gray-100 pt-4">
            {pct > 0 ? (
              <p className="text-sm text-gray-400">
                <span className="line-through">{fmt(room.originalPrice!)}</span>
              </p>
            ) : (
              <p className="text-sm text-transparent">—</p>
            )}
            <p className="mt-0.5">
              <span className="font-heading text-2xl font-bold text-gold">{fmt(room.price)}</span>
              <span className="text-sm text-slate"> / night</span>
            </p>
          </div>

          <Link
            href={`/rooms/${room.slug}`}
            className="mt-4 flex w-full items-center justify-center gap-2 bg-gold px-4 py-2.5 text-sm font-semibold text-navy-dark transition hover:brightness-95"
          >
            View Details &amp; Book <ArrowRight className="size-4" />
          </Link>
          <BookingComLink
            href={bookingComHref}
            roomName={room.name}
            className="mt-2 block text-center text-xs font-medium text-slate underline decoration-gray-300 underline-offset-2 hover:text-navy"
          />
        </div>
      </div>
    </article>
  );
}

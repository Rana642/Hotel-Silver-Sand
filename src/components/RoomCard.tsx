import Image from "next/image";
import Link from "next/link";
import {
  Users,
  Wind,
  Wifi,
  Refrigerator,
  Tv,
  Bath,
  Utensils,
  CalendarDays,
  ExternalLink,
} from "lucide-react";
import type { Room } from "@/data/rooms";
import { bookingComLink } from "@/data/site";

const featureIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Air Conditioning": Wind,
  "High-Speed WiFi": Wifi,
  "Mini Fridge": Refrigerator,
  "Smart/Flat-screen TV": Tv,
  "Attached Private Bathroom": Bath,
  "Room Service": Utensils,
};

function fmt(n: number) {
  return "PKR " + n.toLocaleString("en-US");
}

export default function RoomCard({ room }: { room: Room }) {
  const bookingComHref = room.bookingUrl || bookingComLink(`room_card_${room.slug}`);

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-card transition hover:shadow-pop">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={room.image}
          alt={room.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
        <span className="absolute right-3 top-3 rounded-full bg-navy px-3 py-1 text-xs font-semibold text-white">
          {room.name}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-heading text-xl font-bold text-navy">{room.name}</h3>

        <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-cream px-3 py-1 text-sm text-slate">
          <Users className="size-4 text-gold" /> {room.capacity}
        </span>

        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-navy/60">
          Features include:
        </p>
        <ul className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
          {room.features.map((f) => {
            const Icon = featureIcons[f] ?? Wind;
            return (
              <li key={f} className="flex items-center gap-2 text-sm text-slate">
                <Icon className="size-4 shrink-0 text-gold" /> {f}
              </li>
            );
          })}
        </ul>

        <div className="mt-5 border-t border-gray-100 pt-4">
          <div className="flex items-end justify-between gap-2">
            <div>
              {room.originalPrice && (
                <p className="text-sm text-gray-400">
                  <span className="line-through">{fmt(room.originalPrice)}</span>{" "}
                  {room.save && (
                    <span className="font-semibold text-green-600">Save {fmt(room.save)}</span>
                  )}
                </p>
              )}
              <p>
                <span className="font-heading text-2xl font-bold text-gold">{fmt(room.price)}</span>
                <span className="text-sm text-slate"> / night</span>
              </p>
            </div>
            {room.available && (
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                Available
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          <Link
            href={`/rooms/${room.slug}`}
            className="block w-full rounded-md border border-navy/20 px-4 py-2.5 text-center text-sm font-semibold text-navy transition hover:bg-navy hover:text-white"
          >
            View Details
          </Link>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <Link
              href={`/rooms/${room.slug}`}
              className="flex items-center justify-center gap-1.5 rounded-md bg-gold px-4 py-2.5 text-sm font-semibold text-navy-dark transition hover:brightness-95"
            >
              <CalendarDays className="size-4" /> Book Direct
            </Link>
            <a
              href={bookingComHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-dark"
            >
              Book on Booking.com <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

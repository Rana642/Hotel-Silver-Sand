import Image from "next/image";
import Link from "next/link";
import { Maximize, Users, Eye, ArrowRight } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import RoomSearchBar from "@/components/RoomSearchBar";
import ViewTracker from "@/components/ViewTracker";
import { getRoomsStatic, roomPricing, featuredImage } from "@/lib/rooms";
import { pageMeta } from "@/lib/seo";
import { pkr } from "@/lib/format";

export const revalidate = 60;

export const metadata = pageMeta({
  title: "Hotel Rooms in Multan — Rates & Availability",
  description:
    "Book a hotel room in Multan from PKR 3,000 a night. Deluxe King, Deluxe Double, Deluxe Triple and Budget Twin rooms at Hotel Silver Sand Multan Cantt — air conditioning, free WiFi, private attached bathroom and free parking. Pay at the hotel.",
  path: "/rooms",
});

export default async function RoomsPage() {
  const rooms = await getRoomsStatic();

  return (
    <>
      <ViewTracker event="view_item_list" params={{ list_name: "rooms", items: rooms.length }} />
      {/* Hero + search */}
      <section className="bg-navy">
        <div className="container-site py-14 text-center text-white sm:py-16">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl">Hotel Rooms in Multan</h1>
          <p className="subtitle-serif mt-2 text-lg text-gold">Comfort designed for every traveler</p>
          <div className="mx-auto mt-8 max-w-4xl rounded-xl border border-white/10 bg-white/5 p-4">
            <RoomSearchBar />
          </div>
        </div>
      </section>

      <section className="bg-cream">
        <div className="container-site py-14 sm:py-20">
          <SectionHeading title="Every Room We Have" subtitle="Four room types — no suites, no upsell ladder" />

          <div id="room-list" className="mt-10 scroll-mt-24 space-y-8">
            {rooms.map((room) => {
              const { price, original, discountPct, gst } = roomPricing(room);
              const tags = (room.amenities ?? []).slice(0, 4);
              return (
                <article
                  key={room.id}
                  className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-card"
                >
                  <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
                    <Image
                      src={featuredImage(room)}
                      alt={room.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 1200px"
                      className="object-cover"
                    />
                  </div>

                  <div className="p-6 text-center sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gold">
                      {room.capacity ?? `${room.max_adults} Adults`}
                      {room.size_sqft ? ` · ${room.size_sqft} sq ft` : ""}
                    </p>
                    <h2 className="mt-1 font-heading text-2xl font-bold text-navy">{room.name}</h2>

                    <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                      {original && <span className="text-gray-400 line-through">{pkr(original)}</span>}
                      <span className="text-xl font-bold text-gold">{pkr(price)}</span>
                      <span className="text-sm text-slate">/ night</span>
                      {discountPct > 0 && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                          Save {discountPct}%
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate">+ {pkr(gst)} GST per night (excluded)</p>

                    {room.description && (
                      <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate">{room.description}</p>
                    )}

                    {tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 rounded-lg bg-navy px-4 py-3">
                        {tags.map((t) => (
                          <span key={t} className="text-xs font-medium text-white/90">{t}</span>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-sm text-slate">
                      {room.size_sqft && (
                        <span className="flex items-center gap-1.5"><Maximize className="size-4 text-gold" /> {room.size_sqft} sq ft</span>
                      )}
                      <span className="flex items-center gap-1.5"><Users className="size-4 text-gold" /> {room.capacity}</span>
                      {room.view && (
                        <span className="flex items-center gap-1.5"><Eye className="size-4 text-gold" /> {room.view}</span>
                      )}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                      <Link
                        href={`/rooms/${room.slug}`}
                        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-navy/20 px-6 py-3 text-sm font-semibold text-navy transition hover:bg-navy hover:text-white"
                      >
                        View Details <ArrowRight className="size-4" />
                      </Link>
                      <Link
                        href="/reservations"
                        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-navy-dark transition hover:brightness-95"
                      >
                        Check Availability
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

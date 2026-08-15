import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Maximize, Users, Eye, Check, MapPin, ArrowRight } from "lucide-react";
import RoomGallery from "@/components/RoomGallery";
import RoomBookingForm from "@/components/RoomBookingForm";
import ViewTracker from "@/components/ViewTracker";
import JsonLd from "@/components/JsonLd";
import { getRoomsStatic, getRoomBySlugStatic, roomPricing, featuredImage } from "@/lib/rooms";
import { pageMeta } from "@/lib/seo";
import { site } from "@/data/site";
import { pkr } from "@/lib/format";

export const revalidate = 60;

export async function generateStaticParams() {
  const rooms = await getRoomsStatic();
  return rooms.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const room = await getRoomBySlugStatic(slug);
  if (!room) return {};
  return pageMeta({
    title: `${room.name} in Multan`,
    description: room.description ?? `Book the ${room.name} at ${site.name}, Multan Cantt.`,
    path: `/rooms/${room.slug}`,
  });
}

export default async function RoomDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const room = await getRoomBySlugStatic(slug);
  if (!room || !room.is_active) notFound();

  const { price, original, discountPct, gst } = roomPricing(room);
  const amenities = room.amenities ?? [];
  const whyBook = room.why_book ?? [];
  const goodToKnow = Object.entries(room.good_to_know ?? {});
  const nearby = room.nearby ?? [];
  const faqs = room.faqs ?? [];
  const others = (await getRoomsStatic()).filter((r) => r.slug !== room.slug).slice(0, 2);

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "HotelRoom",
      name: room.name,
      description: room.description,
      image: featuredImage(room),
      occupancy: { "@type": "QuantitativeValue", maxValue: room.max_adults + room.max_children },
      ...(room.size_sqft ? { floorSize: { "@type": "QuantitativeValue", value: room.size_sqft, unitCode: "FTK" } } : {}),
      amenityFeature: amenities.map((a) => ({ "@type": "LocationFeatureSpecification", name: a, value: true })),
      offers: { "@type": "Offer", price, priceCurrency: "PKR", availability: "https://schema.org/InStock" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        { "@type": "ListItem", position: 2, name: "Rooms", item: `${site.url}/rooms` },
        { "@type": "ListItem", position: 3, name: room.name, item: `${site.url}/rooms/${room.slug}` },
      ],
    },
  ];
  if (faqs.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <ViewTracker event="view_item" params={{ item_name: room.name, item_id: room.slug, price, currency: "PKR" }} />

      {/* Hero banner */}
      <section className="relative h-56 w-full sm:h-72">
        <Image src={featuredImage(room)} alt={room.name} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-navy-dark/40" />
      </section>

      <section className="bg-cream">
        <div className="container-site py-10 sm:py-14">
          {/* Breadcrumb */}
          <nav className="text-sm text-slate" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-gold">Home</Link> /{" "}
            <Link href="/rooms" className="hover:text-gold">Rooms</Link> /{" "}
            <span className="text-navy">{room.name}</span>
          </nav>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* Left */}
            <div>
              <RoomGallery images={room.room_images} name={room.name} />

              <div className="mt-8">
                <h1 className="font-heading text-3xl font-bold text-navy">{room.name}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {original && <span className="text-gray-400 line-through">{pkr(original)}</span>}
                  <span className="text-xl font-bold text-gold">{pkr(price)}</span>
                  <span className="text-sm text-slate">/ night</span>
                  {discountPct > 0 && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">Save {discountPct}%</span>
                  )}
                  <span className="text-xs text-slate">+ {pkr(gst)} GST (excluded)</span>
                </div>
                {room.description && <p className="mt-4 leading-relaxed text-slate">{room.description}</p>}

                {room.ideal_for && (
                  <div className="mt-5 rounded-md border-l-4 border-gold bg-white p-4 text-sm text-navy shadow-card">
                    <strong>Ideal for:</strong> {room.ideal_for}
                  </div>
                )}

                {/* Quick facts */}
                <div className="mt-6 flex flex-wrap gap-6 border-y border-gray-200 py-4 text-sm text-navy">
                  {room.size_sqft && <span className="flex items-center gap-2"><Maximize className="size-5 text-gold" /> {room.size_sqft} sq ft</span>}
                  <span className="flex items-center gap-2"><Users className="size-5 text-gold" /> {room.capacity}</span>
                  {room.view && <span className="flex items-center gap-2"><Eye className="size-5 text-gold" /> {room.view}</span>}
                </div>

                {/* Amenities */}
                {amenities.length > 0 && (
                  <div className="mt-8">
                    <h2 className="font-heading text-xl font-bold text-navy">Room Amenities</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {amenities.map((a) => (
                        <span key={a} className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-navy">{a}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Why book */}
                {whyBook.length > 0 && (
                  <div className="mt-8">
                    <h2 className="font-heading text-xl font-bold text-navy">Why Book This Room</h2>
                    <ul className="mt-3 space-y-2">
                      {whyBook.map((w) => (
                        <li key={w} className="flex items-start gap-2 text-sm text-slate">
                          <Check className="mt-0.5 size-4 shrink-0 text-gold" /> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Good to know */}
                {goodToKnow.length > 0 && (
                  <div className="mt-8">
                    <h2 className="font-heading text-xl font-bold text-navy">Good to Know</h2>
                    <div className="mt-3 overflow-hidden rounded-lg border border-gray-100 bg-white">
                      <table className="w-full text-left text-sm">
                        <tbody>
                          {goodToKnow.map(([k, v]) => (
                            <tr key={k} className="border-b border-gray-50 last:border-0">
                              <td className="w-40 px-4 py-2.5 font-medium text-slate">{k}</td>
                              <td className="px-4 py-2.5 text-navy">{v}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Nearby */}
                {nearby.length > 0 && (
                  <div className="mt-8">
                    <h2 className="font-heading text-xl font-bold text-navy">Location &amp; What&apos;s Nearby</h2>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {nearby.map((n) => (
                        <div key={n.place} className="flex items-center justify-between rounded-md border border-gray-100 bg-white px-4 py-2.5 text-sm">
                          <span className="flex items-center gap-2 text-navy"><MapPin className="size-4 text-gold" /> {n.place}</span>
                          <span className="font-semibold text-slate">{n.distance}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FAQ */}
                {faqs.length > 0 && (
                  <div className="mt-8">
                    <h2 className="font-heading text-xl font-bold text-navy">Frequently Asked Questions</h2>
                    <div className="mt-3 space-y-3">
                      {faqs.map((f) => (
                        <div key={f.q} className="rounded-lg border border-gray-100 bg-white p-4">
                          <p className="font-semibold text-navy">{f.q}</p>
                          <p className="mt-1 text-sm text-slate">{f.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right widget */}
            <div>
              <RoomBookingForm
                roomName={room.name}
                roomSlug={room.slug}
                price={price}
                original={original}
                discountPct={discountPct}
                gstPercent={Number(room.gst_percent) || 0}
              />
            </div>
          </div>

          {/* Other rooms */}
          {others.length > 0 && (
            <div className="mt-16">
              <h2 className="font-heading text-2xl font-bold text-navy">Other Rooms You May Like</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {others.map((r) => (
                  <Link key={r.id} href={`/rooms/${r.slug}`} className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-card transition hover:shadow-pop">
                    <div className="relative aspect-[16/10]">
                      <Image src={featuredImage(r)} alt={r.name} fill sizes="500px" className="object-cover transition group-hover:scale-105" />
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-heading font-bold text-navy">{r.name}</p>
                        <p className="text-sm text-gold">{pkr(roomPricing(r).price)} / night</p>
                      </div>
                      <ArrowRight className="size-5 text-gold" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

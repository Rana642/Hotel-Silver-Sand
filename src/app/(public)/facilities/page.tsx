import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import AmenityCard from "@/components/AmenityCard";
import { facilities } from "@/data/amenities";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Facilities & Amenities",
  description:
    "Free high-speed WiFi, air conditioning, 24/7 room service, smart TVs, mini fridge and hot & cold water — everything you need for a comfortable stay at Hotel Silver Sand Multan.",
  path: "/facilities",
});

export default function FacilitiesPage() {
  return (
    <>
      <PageHero
        title="Facilities & Amenities"
        subtitle="Everything you need for a comfortable stay"
      />

      <section className="bg-cream">
        <div className="container-site py-16 sm:py-20">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.map((f) => (
              <AmenityCard key={f.title} amenity={f} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="container-site grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2">
          <div className="relative aspect-[5/4] overflow-hidden rounded-xl shadow-card">
            <Image
              src="/images/facilities/hallway.webp"
              alt="Clean, well-lit hallway at Hotel Silver Sand Multan"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-heading text-3xl font-bold text-navy sm:text-4xl">
              Premium Comfort &amp; Convenience
            </h2>
            <p className="subtitle-serif mt-2 text-lg">Designed for your ultimate satisfaction</p>
            <p className="mt-5 leading-relaxed text-slate">
              At Hotel Silver Sand Multan, we understand that the little details make a big
              difference. That&apos;s why we&apos;ve equipped our hotel with modern amenities and
              facilities to ensure your stay is as comfortable and convenient as possible.
            </p>
            <p className="mt-4 leading-relaxed text-slate">
              From complimentary high-speed WiFi to 24/7 room service, from secure parking to
              round-the-clock security, we&apos;ve thought of everything to make your stay memorable.
              Whether you&apos;re here for business or leisure, our facilities are designed to meet
              all your needs.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

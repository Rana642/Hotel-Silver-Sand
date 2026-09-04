import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import AmenityCard from "@/components/AmenityCard";
import { facilities } from "@/data/amenities";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Hotel Facilities in Multan Cantt",
  description:
    "Free WiFi rated 10/10, air conditioning, soundproofed rooms, free private parking, a 24-hour front desk, airport pick-up and breakfast included — the facilities at Hotel Silver Sand, a hotel in Multan Cantt 500 m from the railway station.",
  path: "/facilities",
});

export default function FacilitiesPage() {
  return (
    <>
      <PageHero
        title="Facilities & Amenities"
        subtitle="What we actually have — and what we don't"
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
              We&apos;d Rather Be Honest Than Impressive
            </h2>
            <p className="subtitle-serif mt-2 text-lg">An affordable hotel in Multan, not a resort</p>
            <p className="mt-5 leading-relaxed text-slate">
              There is no swimming pool here. No spa, and no restaurant of our own. We would rather
              you read that on this page than discover it at the front desk, because a hotel room in
              Multan at our rate cannot honestly promise all three.
            </p>
            <p className="mt-4 leading-relaxed text-slate">
              What we spend the money on instead is the part you actually sleep in. Air conditioning
              in every room. Soundproofing, so being 500 metres from Multan Cantt Railway Station
              costs you convenience and not a night&apos;s sleep. WiFi our guests score 10 out of 10.
              Free private parking behind our own gate. Breakfast included. And a front desk that is
              staffed at three in the morning, because that is when trains arrive.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/reservations"
                className="inline-block bg-gold px-6 py-3 text-sm font-semibold text-navy-dark transition hover:brightness-95"
              >
                Check Availability
              </Link>
              <Link
                href="/faq"
                className="inline-block border border-navy px-6 py-3 text-sm font-semibold text-navy transition hover:bg-navy hover:text-white"
              >
                Read the FAQs &amp; Policies
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

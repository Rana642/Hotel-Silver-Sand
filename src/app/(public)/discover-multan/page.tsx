import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import CTASection from "@/components/CTASection";
import { destinations } from "@/data/destinations";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Discover Multan | Places to Visit Near Hotel Silver Sand",
  description:
    "Explore the best places to visit in Multan — Shah Rukn-e-Alam Shrine, blue pottery and Multani mangoes — while staying at Hotel Silver Sand Multan in Multan Cantt.",
  path: "/discover-multan",
  absoluteTitle: true,
});

export default function DiscoverMultanPage() {
  return (
    <>
      <PageHero
        title="Discover Multan"
        subtitle="Explore the City of Saints, Sufis & Mangoes"
      />

      <section className="bg-cream">
        <div className="container-site py-14 sm:py-16">
          <p className="mx-auto max-w-3xl text-center leading-relaxed text-slate">
            Explore the best places to visit in Multan and stay just minutes away at{" "}
            <strong className="text-navy">Hotel Silver Sand Multan</strong> — your trusted,
            affordable hotel in Multan Cantt, close to Multan International Airport and the Railway
            Station, serving guests since 1986.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {destinations.map((d) => (
              <article
                key={d.title}
                className="flex flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-card transition hover:shadow-pop"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <Image
                    src={d.image}
                    alt={d.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="font-heading text-xl font-bold text-navy">{d.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate">{d.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Experience Multan?"
        text="Make Hotel Silver Sand Multan your comfortable home base while you explore the rich history and culture of the city."
        showViewRooms
      />
    </>
  );
}

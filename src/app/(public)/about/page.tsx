import type { Metadata } from "next";
import Image from "next/image";
import { Award, MapPin, Clock, Check } from "lucide-react";
import PageHero from "@/components/PageHero";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "About Hotel Silver Sand Multan",
  description:
    "Since 1986, Hotel Silver Sand Multan has been a trusted, family-run hotel in Multan Cantt offering comfortable, affordable stays with personalized service.",
  path: "/about",
  absoluteTitle: true,
});

const stats = [
  {
    icon: Award,
    title: "Established 1986",
    text: "40 years of trusted hospitality and service excellence in Multan",
  },
  {
    icon: MapPin,
    title: "Prime Location",
    text: "Conveniently located in Multan Cantt, 8 minutes from the airport",
  },
  {
    icon: Clock,
    title: "24/7 Service",
    text: "Round-the-clock assistance to ensure your comfort and satisfaction",
  },
];

const mission = [
  "Maintaining clean, well-equipped rooms with modern amenities",
  "Providing personalized, attentive service from our dedicated staff",
  "Ensuring 24/7 security and safety for all our guests",
  "Offering competitive rates without compromising on quality",
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About Hotel Silver Sand Multan"
        subtitle="40 years of hospitality excellence"
      />

      {/* Our Story */}
      <section className="bg-cream">
        <div className="container-site py-16 sm:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="relative aspect-[5/4] overflow-hidden rounded-xl shadow-card">
              <Image
                src="/images/about/story.png"
                alt="Hotel Silver Sand Multan building"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="font-heading text-3xl font-bold text-navy sm:text-4xl">Our Story</h2>
              <p className="subtitle-serif mt-2 text-lg">Four decades of trusted service</p>
              <p className="mt-5 leading-relaxed text-slate">
                Since 1986, Hotel Silver Sand Multan has been a cornerstone of hospitality in
                Multan. What started as a vision to provide comfortable, affordable accommodation
                has grown into one of Multan Cantt&apos;s most trusted hotels, serving thousands of
                satisfied guests over four decades.
              </p>
              <p className="mt-4 leading-relaxed text-slate">
                Our commitment to excellence, personalized service, and competitive pricing has
                remained unchanged throughout the years. We take pride in being a family-run
                establishment that treats every guest like family.
              </p>
              <p className="mt-4 leading-relaxed text-slate">
                Located just 8 minutes from Multan International Airport and close to the Railway
                Station, Hotel Silver Sand Multan offers the perfect blend of convenience and
                comfort for both business and leisure travelers visiting the City of Saints.
              </p>
            </div>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {stats.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-lg border border-gray-100 bg-white p-6 text-center shadow-card"
              >
                <Icon className="mx-auto size-9 text-gold" />
                <h3 className="mt-4 font-heading text-lg font-bold text-navy">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="bg-white">
        <div className="container-site grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-3xl font-bold text-navy sm:text-4xl">Our Mission</h2>
            <p className="subtitle-serif mt-2 text-lg">Committed to your comfort</p>
            <p className="mt-5 leading-relaxed text-slate">
              At Hotel Silver Sand Multan, our mission is simple: to provide every guest with a
              comfortable, safe, and memorable stay at an affordable price. We believe that quality
              hospitality should be accessible to everyone, whether you&apos;re traveling for
              business, leisure, or visiting family.
            </p>
            <p className="mt-5 font-semibold text-navy">We achieve this through:</p>
            <ul className="mt-3 space-y-3">
              {mission.map((m) => (
                <li key={m} className="flex gap-3 text-slate">
                  <Check className="mt-0.5 size-5 shrink-0 text-gold" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-[5/4] overflow-hidden rounded-xl shadow-card">
            <Image
              src="/images/about/mission.jpg"
              alt="Staff assisting guests at Hotel Silver Sand Multan"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </>
  );
}

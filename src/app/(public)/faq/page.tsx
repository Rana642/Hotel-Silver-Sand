import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, MessageCircle, XCircle } from "lucide-react";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import JsonLd from "@/components/JsonLd";
import FaqAccordion from "@/components/FaqAccordion";
import { faqs, housePolicies, distances, notAvailable } from "@/data/hotel-facts";
import { pageMeta, faqSchema } from "@/lib/seo";
import { site, tel, waLink } from "@/data/site";

export const metadata: Metadata = pageMeta({
  title: "FAQs, Hotel Policies & Check-in Times",
  description:
    "Check-in and check-out times, parking, breakfast, airport pick-up, extra beds and distances from Multan Cantt Railway Station — everything guests ask before booking a hotel in Multan, answered plainly.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqSchema(faqs)} />

      <PageHero
        title="Questions, Answered Honestly"
        subtitle="Including the four answers that are simply “no”"
      />

      {/* Answers first — this is what the visitor came for */}
      <section className="bg-white">
        <div className="container-site max-w-4xl py-14 sm:py-16">
          <p className="mb-8 leading-relaxed text-slate">
            These are the questions guests actually ask us before booking a hotel room in Multan.
            We have answered every one of them straight — where the answer is no, we say no, because
            finding out at the front desk is worse than finding out here.
          </p>
          <FaqAccordion items={faqs} />

          <div className="mt-10 border border-gold/40 bg-cream p-5 sm:p-6">
            <p className="font-heading text-lg font-bold text-navy">Still not sure about something?</p>
            <p className="mt-1 text-sm leading-relaxed text-slate">
              Ask us before you book — we answer at any hour, and there is no charge for changing
              your mind. No prepayment is needed either; you pay at the hotel.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={waLink("Assalam o Alaikum, I have a question about booking a room at Hotel Silver Sand Multan.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-dark"
              >
                <MessageCircle className="size-4" /> Ask on WhatsApp
              </a>
              <a
                href={tel}
                className="inline-flex items-center gap-2 border border-navy px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-navy hover:text-white"
              >
                <Phone className="size-4" /> Call {site.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* House rules — the second thing people look for */}
      <section className="bg-cream">
        <div className="container-site py-14 sm:py-16">
          <SectionHeading
            title="Hotel Policies"
            subtitle="No surprises at the front desk"
          />
          <div className="mx-auto mt-8 grid max-w-4xl gap-px overflow-hidden border border-gray-200 bg-gray-200 sm:grid-cols-2">
            {housePolicies.map((p) => (
              <div key={p.label} className="bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate">{p.label}</p>
                <p className="mt-1 font-heading text-lg font-bold text-navy">{p.value}</p>
                {p.note && <p className="mt-1 text-sm leading-relaxed text-slate">{p.note}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Distances — the strongest reason to choose this hotel */}
      <section className="bg-white">
        <div className="container-site py-14 sm:py-16">
          <SectionHeading
            title="How Far Is Everything?"
            subtitle="Measured, not estimated"
          />
          <div className="mx-auto mt-8 max-w-3xl divide-y divide-gray-200 border-y border-gray-200">
            {distances.map((d) => (
              <div key={d.place} className="flex items-baseline justify-between gap-4 py-4">
                <span className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
                  <span>
                    <span className="font-semibold text-navy">{d.place}</span>
                    {d.note && <span className="block text-sm text-slate">{d.note}</span>}
                  </span>
                </span>
                <span className="shrink-0 font-heading text-lg font-bold text-gold">{d.distance}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we don't have — honesty protects the review score */}
      <section className="bg-navy">
        <div className="container-site py-14 text-center sm:py-16">
          <SectionHeading
            light
            title="What We Don't Have"
            subtitle="Better you know now than on arrival"
          />
          <ul className="mx-auto mt-7 flex max-w-2xl flex-wrap justify-center gap-3">
            {notAvailable.map((n) => (
              <li
                key={n}
                className="inline-flex items-center gap-2 border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/85"
              >
                <XCircle className="size-4 shrink-0 text-gold" /> {n}
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-white/75">
            Hotel Silver Sand is an affordable hotel in Multan Cantt, not a resort. What we spend on
            instead: clean air-conditioned rooms, soundproofing that actually keeps the street out,
            WiFi our guests rate 10 out of 10, free private parking, and a front desk that answers at
            three in the morning.
          </p>
          <Link
            href="/reservations"
            className="mt-7 inline-block bg-gold px-8 py-3 font-semibold text-navy-dark transition hover:brightness-95"
          >
            Check Availability
          </Link>
        </div>
      </section>
    </>
  );
}

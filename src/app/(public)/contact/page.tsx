import type { Metadata } from "next";
import { MapPin, Phone, MessageCircle, Mail, Clock, Star } from "lucide-react";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import { ButtonLink } from "@/components/Button";
import TrackedLink from "@/components/TrackedLink";
import MapDirections from "@/components/MapDirections";
import { site, tel, waLink, mapEmbedUrl } from "@/data/site";
import { distances, housePolicies } from "@/data/hotel-facts";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Contact Hotel Silver Sand — Hotel in Multan Cantt",
  description:
    "Call or WhatsApp Hotel Silver Sand Multan to book a room. We are at 514 Akbar Road, Multan Cantt — a 500 m walk from Multan Cantt Railway Station and 2.4 km from the airport. Front desk open 24 hours, every day.",
  path: "/contact",
  absoluteTitle: true,
});

const cards = [
  { icon: MapPin, title: "Address", lines: [site.address.full] },
  { icon: Phone, title: "Phone Number", lines: [site.phone], href: tel },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    lines: [site.whatsapp, "Quick reservations and instant responses"],
    href: waLink(),
    external: true,
  },
  { icon: Mail, title: "Email", lines: [site.email], href: `mailto:${site.email}` },
  { icon: Clock, title: "Front Desk Hours", lines: ["24/7 — We're always here for you"] },
  {
    icon: Star,
    title: "Leave a Google Review",
    lines: ["Loved your stay? Share your experience"],
    href: site.reviewUrl,
    external: true,
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero title="Contact Us" subtitle="We're here to help" />

      <section className="bg-cream">
        <div className="container-site grid gap-10 py-16 sm:py-20 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-2xl font-bold text-navy">Get in Touch</h2>
            <p className="mt-3 leading-relaxed text-slate">
              Have questions or ready to book your stay? We&apos;re here to assist you. Reach out to
              us through any of the following channels, and our friendly staff will be happy to help.
            </p>
            <div className="mt-6 space-y-4">
              {cards.map(({ icon: Icon, title, lines, href, external }) => {
                const body = (
                  <div className="flex gap-4 rounded-lg border border-gray-100 bg-white p-5 shadow-card transition hover:shadow-pop">
                    <Icon className="mt-0.5 size-6 shrink-0 text-gold" />
                    <div>
                      <p className="font-heading font-bold text-navy">{title}</p>
                      {lines.map((l) => (
                        <p key={l} className="mt-0.5 text-sm text-slate">
                          {l}
                        </p>
                      ))}
                    </div>
                  </div>
                );
                return href ? (
                  <a
                    key={title}
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="block"
                  >
                    {body}
                  </a>
                ) : (
                  <div key={title}>{body}</div>
                );
              })}
            </div>
          </div>

          <div className="flex h-full flex-col justify-center rounded-xl border border-gray-100 bg-white p-6 shadow-card sm:p-8">
            <h2 className="font-heading text-2xl font-bold text-navy">Talk to Us Directly</h2>
            <p className="mt-3 leading-relaxed text-slate">
              The fastest way to reach us is a quick call or WhatsApp — our front desk is available
              24/7 for reservations and questions.
            </p>
            <div className="mt-6 space-y-3">
              <a
                href={tel}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-navy px-6 py-3 font-semibold text-white transition hover:bg-navy-dark"
              >
                <Phone className="size-5" /> Call {site.phone}
              </a>
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[#25D366] px-6 py-3 font-semibold text-white transition hover:brightness-95"
              >
                <MessageCircle className="size-5" /> Chat on WhatsApp
              </a>
              <a
                href={`mailto:${site.email}`}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-navy/20 px-6 py-3 font-semibold text-navy transition hover:bg-navy hover:text-white"
              >
                <Mail className="size-5" /> Email Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="container-site py-16 sm:py-20">
          <SectionHeading title="Find Us on the Map" />
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="overflow-hidden rounded-xl border border-gray-100 shadow-card">
              <iframe
                src={mapEmbedUrl()}
                title="Hotel Silver Sand Multan location on Google Maps"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="aspect-[16/10] w-full lg:aspect-auto lg:h-full lg:min-h-[380px]"
              />
            </div>
            <div className="rounded-xl border border-gray-100 bg-cream p-6 shadow-card">
              <h3 className="font-heading text-lg font-bold text-navy">Get Directions</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate">
                We are on Akbar Road in Multan Cantt, near Aziz Hotel Chowk. Coming off a train?
                Walk out of Multan Cantt Railway Station and you are here in about six minutes —
                it is 500 m. From Multan International Airport it is 2.4 km, roughly eight minutes
                by car, and the city centre is about ten minutes away.
              </p>
              <ul className="mt-3 space-y-1.5 border-t border-gray-200 pt-3 text-sm text-slate">
                {distances.slice(0, 3).map((d) => (
                  <li key={d.place} className="flex justify-between gap-3">
                    <span>{d.place}</span>
                    <span className="shrink-0 font-semibold text-navy">{d.distance}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <MapDirections />
              </div>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <TrackedLink
                  href={site.mapDirections}
                  event="directions_click"
                  params={{ location: "contact_page" }}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-gold"
                  external
                >
                  <MapPin className="size-4 text-gold" /> Open in Google Maps
                </TrackedLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Good to know — the four policies people phone the front desk to ask about */}
      <section className="bg-cream">
        <div className="container-site py-14 sm:py-16">
          <SectionHeading title="Good to Know" subtitle="Before you call, this may already answer it" />
          <div className="mx-auto mt-8 grid max-w-4xl gap-px overflow-hidden border border-gray-200 bg-gray-200 sm:grid-cols-2 lg:grid-cols-4">
            {housePolicies.slice(0, 4).map((p) => (
              <div key={p.label} className="bg-white p-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate">{p.label}</p>
                <p className="mt-1 font-heading text-lg font-bold text-navy">{p.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <ButtonLink href="/faq" variant="outline">
              All FAQs &amp; Hotel Policies
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

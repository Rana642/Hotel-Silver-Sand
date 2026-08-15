import type { Metadata } from "next";
import { MapPin, Phone, MessageCircle, Mail, Clock, Star } from "lucide-react";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";
import SectionHeading from "@/components/SectionHeading";
import { ButtonLink } from "@/components/Button";
import TrackedLink from "@/components/TrackedLink";
import MapDirections from "@/components/MapDirections";
import { site, tel, waLink, mapEmbedUrl } from "@/data/site";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Contact Hotel Silver Sand Multan",
  description:
    "Get in touch with Hotel Silver Sand Multan in Multan Cantt. Call, WhatsApp or email us for reservations and enquiries. Front desk open 24/7.",
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

          <ContactForm />
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
                Hotel Silver Sand is in the heart of Multan Cantt — 8 minutes from Multan International
                Airport and close to the Railway Station, Aziz Hotel Chowk and the city&apos;s major
                landmarks.
              </p>
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
    </>
  );
}

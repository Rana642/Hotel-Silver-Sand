import type { Metadata } from "next";
import { MapPin, Phone, MessageCircle, Mail, Clock } from "lucide-react";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";
import SectionHeading from "@/components/SectionHeading";
import { ButtonLink } from "@/components/Button";
import { site, tel, waLink } from "@/data/site";
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
          <div className="mt-8 overflow-hidden rounded-xl border border-gray-100 shadow-card">
            <iframe
              src={site.mapEmbed}
              title="Hotel Silver Sand Multan location on Google Maps"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="aspect-[16/9] w-full"
            />
          </div>
          <div className="mt-6 text-center">
            <ButtonLink href={site.mapDirections} variant="gold" external>
              <MapPin className="size-4" /> Get Directions on Google Maps
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { site } from "@/data/site";

export function pageMeta({
  title,
  description,
  path,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
}): Metadata {
  const url = `${site.url}${path}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      type: "website",
      locale: "en_PK",
      images: [{ url: "/images/hero.png", width: 1672, height: 941, alt: site.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/hero.png"],
    },
  };
}

/**
 * Structured data for the property.
 *
 * Deliberately omitted:
 * - `aggregateRating` — the only verifiable public score is Booking.com's 6.2/10 from
 *   19 reviews. Review markup must reflect reviews collected by this site, so asserting
 *   any rating here would be fabricated. Omitted until a real on-site review source exists.
 * - `starRating` — Booking.com classifies the property as 2-star. Rather than assert a
 *   different number, the field is left out.
 * - `priceRange` — rates are set by the owner in the admin dashboard and change, so a
 *   hard-coded range would go stale and misstate the price.
 */
export const hotelSchema = {
  "@context": "https://schema.org",
  "@type": "Hotel",
  "@id": `${site.url}/#hotel`,
  name: site.name,
  description: site.description,
  url: site.url,
  telephone: site.phoneIntl,
  email: site.email,
  image: `${site.url}/images/hero.png`,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    addressLocality: "Multan",
    addressRegion: "Punjab",
    postalCode: site.address.postalCode,
    addressCountry: "PK",
  },
  geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
  hasMap: `https://www.google.com/maps/place/?q=place_id:${site.placeId}`,
  sameAs: [
    site.social.facebook,
    site.social.instagram,
    site.social.youtube,
    site.social.tiktok,
    site.social.linkedin,
    site.googleBusinessUrl,
    site.bookingDotComUrl,
  ],
  // Check-in is available 24 hours; check-out is 12:00–13:00.
  checkinTime: "00:00",
  checkoutTime: "13:00",
  petsAllowed: false,
  // Only facilities the property actually publishes on Booking.com.
  amenityFeature: [
    "Free WiFi",
    "Air Conditioning",
    "Free Private Parking",
    "24-Hour Front Desk",
    "Room Service",
    "Airport Shuttle",
    "Soundproof Rooms",
    "Private Attached Bathroom",
    "Balcony",
    "Terrace",
    "Garden",
    "Minimarket",
    "Family Rooms",
    "Non-Smoking Rooms",
    "Facilities for Disabled Guests",
    "Concierge Service",
  ].map((n) => ({ "@type": "LocationFeatureSpecification", name: n, value: true })),
  contactPoint: {
    "@type": "ContactPoint",
    telephone: site.phoneIntl,
    contactType: "reservations",
    availableLanguage: ["en", "ur"],
  },
};

/** FAQPage markup — only ever built from verified answers in @/data/hotel-facts. */
export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  url: site.url,
  publisher: {
    "@type": "Organization",
    name: site.name,
    logo: { "@type": "ImageObject", url: `${site.url}/images/logo-transparent.png` },
  },
};

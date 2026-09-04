import type { Metadata } from "next";
import { site } from "@/data/site";
import { googleRating } from "@/data/hotel-facts";

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
 * `aggregateRating` carries the property's real Google Business Profile score
 * (see `googleRating` in @/data/hotel-facts), which the homepage also displays and
 * links to Google so a visitor can verify it. The previous 4.8 from 120 reviews was
 * fabricated and has been removed.
 *
 * Deliberately omitted:
 * - `starRating` — Booking.com and Google both classify the property as 2-star. The
 *   site does not assert a different number, so the field is left out.
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
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: String(googleRating.value),
    reviewCount: String(googleRating.count),
    bestRating: String(googleRating.scale),
    worstRating: "1",
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

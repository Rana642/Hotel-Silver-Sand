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
      images: [{ url: "/images/og.svg", width: 1200, height: 630, alt: site.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/og.svg"],
    },
  };
}

export const hotelSchema = {
  "@context": "https://schema.org",
  "@type": "Hotel",
  "@id": `${site.url}/#hotel`,
  name: site.name,
  description: site.description,
  url: site.url,
  telephone: site.phoneIntl,
  email: site.email,
  image: `${site.url}/images/og.svg`,
  priceRange: "PKR 4,000 – 11,000",
  starRating: { "@type": "Rating", ratingValue: "3" },
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    addressLocality: "Multan",
    addressRegion: "Punjab",
    postalCode: site.address.postalCode,
    addressCountry: "PK",
  },
  geo: { "@type": "GeoCoordinates", latitude: 30.1984, longitude: 71.4687 },
  checkinTime: "14:00",
  checkoutTime: "12:00",
  amenityFeature: [
    "Free WiFi",
    "Air Conditioning",
    "Room Service",
    "Free Parking",
    "24/7 CCTV",
    "24-Hour Front Desk",
  ].map((n) => ({ "@type": "LocationFeatureSpecification", name: n, value: true })),
  contactPoint: {
    "@type": "ContactPoint",
    telephone: site.phoneIntl,
    contactType: "reservations",
    availableLanguage: ["en", "ur"],
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "120",
  },
};

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

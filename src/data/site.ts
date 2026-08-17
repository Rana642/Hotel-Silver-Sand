export const site = {
  name: "Hotel Silver Sand Multan",
  shortName: "Hotel Silver Sand",
  established: "1986",
  tagline: "40 Years of Trusted Comfort",
  description:
    "40 years of trusted comfort and hospitality in the heart of Multan Cantt. Experience the perfect blend of modern amenities, convenient location, and traditional warmth.",
  url: "https://www.hotelsilversandmultan.com",
  address: {
    street: "514 Akbar Road, Railway Colony, near Aziz Hotel Chowk",
    locality: "Cantt, Multan",
    postalCode: "60000",
    region: "Punjab",
    country: "PK",
    full: "514 Akbar Road, Railway Colony, near Aziz Hotel Chowk, Cantt, Multan, 60000, Pakistan",
  },
  phone: "0300-872-0939",
  phoneIntl: "+923008720939",
  whatsapp: "+92 300 872 0939",
  whatsappNumber: "923008720939",
  email: "info@hotelsilversandmultan.com",
  whatsappChannel: "https://whatsapp.com/channel/0029Vb7pg9iDjiOfo8uNk63s",
  bookingDotComUrl: "https://www.booking.com/hotel/pk/silver-sand-multan-multan.en-gb.html",
  // Real coordinates + placeId for the Multan Cantt property (used by the map embed).
  geo: { lat: 30.182376, lng: 71.4422921 },
  placeId: "ChIJXz1OzmQxOzkR0D8_sKCUClw",
  mapQuery: "Hotel Silver Sand Multan, 514 Akbar Road, Cantt, Multan, Pakistan",
  mapDirections:
    "https://www.google.com/maps/dir/?api=1&destination=Hotel+Silver+Sand+Multan&destination_place_id=ChIJXz1OzmQxOzkR0D8_sKCUClw",
  reviewUrl: "https://g.page/r/CdA_P7CglApcEBM/review",
  googleBusinessUrl:
    "https://www.google.com/search?q=Hotel+Silver+Sand+Multan&stick=H4sIAAAAAAAA_-NgU1I1qDC2NE4yNjQzSU41STVOMU2zMqgwTTZItDRJNEgyME4zTksxWMQq4ZFfkpqjEJyZU5ZavFCcmJei4FuaU5KYBwD_gF7xRAAAAA",
  social: {
    facebook: "https://www.facebook.com/hotelsilversandmultan",
    instagram: "https://www.instagram.com/hotelsilversandmultan",
    youtube: "https://www.youtube.com/@hotelsilversandmultan",
    tiktok: "https://www.tiktok.com/@hotelsilversandmultan",
    linkedin: "https://www.linkedin.com/company/hotelsilversandmultan",
  },
} as const;

/** Google Maps Embed API URL (place mode, uses placeId — pin is always
 * exact). Falls back to the free query embed if no API key is configured. */
export function mapEmbedUrl(zoom = 16) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (key) {
    const p = new URLSearchParams({ key, q: `place_id:${site.placeId}`, zoom: String(zoom) });
    return `https://www.google.com/maps/embed/v1/place?${p.toString()}`;
  }
  return `https://www.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&ll=${site.geo.lat},${site.geo.lng}&z=${zoom}&output=embed`;
}

/** Add UTM parameters to the Booking.com link so we can see how many
 * bookings originate from the website. */
export function bookingComLink(campaign = "book_now") {
  if (!site.bookingDotComUrl) return waLink();
  const u = new URL(site.bookingDotComUrl);
  u.searchParams.set("utm_source", "website");
  u.searchParams.set("utm_medium", "direct");
  u.searchParams.set("utm_campaign", campaign);
  return u.toString();
}

export const tel = `tel:${site.phoneIntl}`;

export function waLink(message?: string) {
  const base = `https://wa.me/${site.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const nav = [
  { label: "Home", href: "/" },
  { label: "Rooms & Suites", href: "/rooms" },
  { label: "Promotions", href: "/promotions" },
  { label: "Facilities", href: "/facilities" },
  { label: "Discover Multan", href: "/discover-multan" },
  { label: "Gallery", href: "/gallery" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
] as const;

export const site = {
  name: "Hotel Silver Sand Multan",
  shortName: "Hotel Silver Sand",
  established: "1986",
  tagline: "40 Years of Trusted Comfort",
  description:
    "40 years of trusted comfort and hospitality in the heart of Multan Cantt. Experience the perfect blend of modern amenities, convenient location, and traditional warmth.",
  url: "https://hotelsilversandmultan.com",
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
  // Set the hotel's real Booking.com property URL here. Empty = fall back to WhatsApp.
  bookingDotComUrl: "",
  mapQuery: "Hotel Silver Sand Multan, 514 Akbar Road, Cantt, Multan, Pakistan",
  mapEmbed:
    "https://www.google.com/maps?q=514+Akbar+Road,+Cantt,+Multan,+Pakistan&output=embed",
  mapDirections:
    "https://www.google.com/maps/dir/?api=1&destination=Hotel+Silver+Sand+Multan,+514+Akbar+Road,+Cantt,+Multan",
  social: {
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
    youtube: "https://youtube.com/",
    tiktok: "https://tiktok.com/",
    linkedin: "https://linkedin.com/",
  },
} as const;

export const tel = `tel:${site.phoneIntl}`;

export function waLink(message?: string) {
  const base = `https://wa.me/${site.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const nav = [
  { label: "Home", href: "/" },
  { label: "Rooms & Suites", href: "/rooms" },
  { label: "Facilities", href: "/facilities" },
  { label: "Discover Multan", href: "/discover-multan" },
  { label: "Gallery", href: "/gallery" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
] as const;

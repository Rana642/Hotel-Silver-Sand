export type Room = {
  slug: string;
  name: string;
  capacity: string;
  maxAdults: number;
  maxChildren: number;
  price: number;
  originalPrice?: number;
  save?: number;
  available: boolean;
  image: string;
  bookingUrl?: string;
  features: string[];
};

/** Confirmed on the Booking.com listing (scraped 2026-09-04). */
export const roomFeatures = [
  "Air Conditioning",
  "Free WiFi",
  "Private Attached Bathroom",
  "Flat-screen TV",
  "Refrigerator",
  "Soundproofing",
];

/**
 * Names, sizes, beds and occupancy mirror the live Booking.com listing so the two
 * channels never disagree.
 *
 * The `price` values are only a build-time FALLBACK for the "From PKR x/night"
 * labels. Live rates come from the database (`useMinRate` / `getRoomsStatic`) and
 * are set by the owner in the admin dashboard off the Booking.com extranet — the
 * public Booking.com page shows post-discount rates, not the standard ones.
 */
export const rooms: Room[] = [
  {
    slug: "deluxe-king-room",
    name: "Deluxe King Room",
    capacity: "2 Adults",
    maxAdults: 2,
    maxChildren: 0,
    price: 3000,
    available: true,
    image: "/images/gallery/851976912.jpg",
    features: [
      "Air Conditioning",
      "Free WiFi",
      "Balcony",
      "Terrace",
      "Soundproofing",
      "Private Attached Bathroom",
    ],
  },
  {
    slug: "deluxe-double-room",
    name: "Deluxe Double Room",
    capacity: "2 Adults",
    maxAdults: 2,
    maxChildren: 0,
    price: 6250,
    available: true,
    image: "/images/gallery/851976968.jpg",
    features: [
      "Air Conditioning",
      "Free WiFi",
      "High Floor",
      "Private Attached Bathroom",
      "Flat-screen TV",
      "Refrigerator",
    ],
  },
  {
    slug: "deluxe-triple-room",
    name: "Deluxe Triple Room",
    capacity: "3 Adults",
    maxAdults: 3,
    maxChildren: 0,
    price: 6250,
    available: true,
    image: "/images/gallery/851976923.jpg",
    features: [
      "Air Conditioning",
      "Free WiFi",
      "Balcony",
      "Terrace",
      "Soundproofing",
      "Private Attached Bathroom",
    ],
  },
  {
    slug: "budget-twin-room",
    name: "Budget Twin Room",
    capacity: "2 Adults",
    maxAdults: 2,
    maxChildren: 0,
    price: 6250,
    available: true,
    image: "/images/gallery/851976974.jpg",
    features: [
      "Air Conditioning",
      "Free WiFi",
      "Two Single Beds",
      "Private Attached Bathroom",
      "Flat-screen TV",
      "Refrigerator",
    ],
  },
];

export const roomTypeOptions = rooms.map((r) => r.name);

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

export const roomFeatures = [
  "Air Conditioning",
  "High-Speed WiFi",
  "Mini Fridge",
  "Smart/Flat-screen TV",
  "Attached Private Bathroom",
  "Room Service",
];

export const rooms: Room[] = [
  {
    slug: "deluxe-king-room",
    name: "Deluxe King Room",
    capacity: "2 Adults",
    maxAdults: 2,
    maxChildren: 0,
    price: 4000,
    originalPrice: 6500,
    save: 2500,
    available: true,
    image: "/images/gallery/851976912.jpg",
    features: roomFeatures,
  },
  {
    slug: "deluxe-triple-room",
    name: "Deluxe Triple Room",
    capacity: "3 Adults",
    maxAdults: 3,
    maxChildren: 0,
    price: 6000,
    originalPrice: 7500,
    save: 1500,
    available: true,
    image: "/images/gallery/851976923.jpg",
    features: roomFeatures,
  },
  {
    slug: "executive-twin-room",
    name: "Executive Twin Room",
    capacity: "4 Adults",
    maxAdults: 4,
    maxChildren: 0,
    price: 9000,
    available: true,
    image: "/images/gallery/851976968.jpg",
    features: roomFeatures,
  },
  {
    slug: "executive-family-room",
    name: "Executive Family Room",
    capacity: "4 Adults + 2 Children",
    maxAdults: 4,
    maxChildren: 2,
    price: 11000,
    available: true,
    image: "/images/gallery/851976974.jpg",
    features: roomFeatures,
  },
];

export const roomTypeOptions = rooms.map((r) => r.name);

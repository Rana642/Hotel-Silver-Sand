// Sync the rooms table to match the live Booking.com listing exactly.
// Booking.com is the source of truth for names, rates, sizes, beds and occupancy.
// Scraped 2026-09-04 from:
//   https://www.booking.com/hotel/pk/silver-sand-multan-multan.en-gb.html
// Run:  node scripts/sync-rooms-from-booking.mjs

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const txt = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of txt.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}
loadEnv();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// m² -> sq ft (the site displays sq ft)
const sqft = (m2) => Math.round(m2 * 10.7639);

// keyed by the CURRENT slug in the database
const rooms = {
  "deluxe-king-room": {
    slug: "deluxe-king-room",
    name: "Deluxe King Room",
    price_per_night: 3000,
    original_price: null,
    size_sqft: sqft(15),
    max_adults: 2,
    max_children: 0,
    capacity: "2 Adults",
    view: "City View",
    sort_order: 1,
    description:
      "A 15 m² king room with a balcony and terrace, soundproofed against street noise. Extra-large double bed, private attached bathroom, flat-screen TV and a refrigerator — our best-value room and the one most guests book.",
    ideal_for: "Best for couples, solo travellers and business guests staying in Multan Cantt.",
    amenities: [
      "Air Conditioning", "Free WiFi", "Balcony", "Terrace", "Soundproofing",
      "Private Attached Bathroom", "Flat-screen TV", "Refrigerator", "Seating Area",
      "Dining Area", "Free Toiletries", "Bath or Shower", "Ironing Facilities",
      "Satellite Channels", "Laptop Safe", "Air Purifier", "Wake-up Service",
    ],
    why_book: [
      "Lowest nightly rate of all our room types",
      "Balcony and terrace — rare at this price in Multan Cantt",
      "Soundproofed so the street and station never wake you",
      "Free WiFi rated 10/10 by Booking.com guests",
    ],
  },

  "deluxe-triple-room": {
    slug: "deluxe-triple-room",
    name: "Deluxe Triple Room",
    price_per_night: 6250,
    original_price: null,
    size_sqft: sqft(17),
    max_adults: 3,
    max_children: 0,
    capacity: "3 Adults",
    view: "City View",
    sort_order: 3,
    description:
      "Our largest room at 17 m², with one double bed and one single bed — enough space for three adults or a small family. Balcony, terrace, soundproofing, private attached bathroom and a refrigerator.",
    ideal_for: "Best for small families and groups of three travelling together.",
    amenities: [
      "Air Conditioning", "Free WiFi", "Balcony", "Terrace", "Soundproofing",
      "Private Attached Bathroom", "Flat-screen TV", "Refrigerator", "Seating Area",
    ],
    why_book: [
      "Three real beds — no squeezing onto a sofa",
      "The largest room we have (17 m²)",
      "Extra beds available for children on request",
      "Balcony and terrace with a city view",
    ],
  },

  // renamed: Executive Twin Room -> Deluxe Double Room (per Booking.com)
  "executive-twin-room": {
    slug: "deluxe-double-room",
    name: "Deluxe Double Room",
    price_per_night: 6250,
    original_price: null,
    size_sqft: null,
    max_adults: 2,
    max_children: 0,
    capacity: "2 Adults",
    view: "High Floor",
    sort_order: 2,
    description:
      "A high-floor double room with one large double bed — quieter and further from the road, with a private attached bathroom, flat-screen TV and free WiFi.",
    ideal_for: "Best for couples who want a quieter, higher-floor room.",
    amenities: [
      "Air Conditioning", "Free WiFi", "High Floor", "Private Attached Bathroom",
      "Flat-screen TV", "Refrigerator",
    ],
    why_book: [
      "High floor — away from street noise",
      "One large double bed for a comfortable night",
      "Free private parking right at the hotel",
      "Check in at any hour, day or night",
    ],
  },

  // renamed: Executive Family Room -> Budget Twin Room (per Booking.com)
  "executive-family-room": {
    slug: "budget-twin-room",
    name: "Budget Twin Room",
    price_per_night: 6250,
    original_price: null,
    size_sqft: null,
    max_adults: 2,
    max_children: 0,
    capacity: "2 Adults",
    view: "City View",
    sort_order: 4,
    description:
      "Two separate single beds with a private attached bathroom, flat-screen TV and free WiFi — the practical choice for colleagues or friends sharing a room.",
    ideal_for: "Best for two colleagues or friends who want separate beds.",
    amenities: [
      "Air Conditioning", "Free WiFi", "Two Single Beds", "Private Attached Bathroom",
      "Flat-screen TV", "Refrigerator",
    ],
    why_book: [
      "Two separate single beds",
      "Free private parking and free WiFi",
      "24-hour front desk for late arrivals",
      "A 500 m walk from Multan Cantt Railway Station",
    ],
  },
};

// Booking.com house rules — shown as "Good to know" on each room page.
const goodToKnow = {
  "Check-in": "Available 24 hours",
  "Check-out": "12:00 – 13:00",
  "Payment": "Cash accepted at the property",
  "Extra bed": "PKR 1,000 per child, per night (0–12 years, on request)",
  "Children": "All ages welcome. Children 3 and above are charged as adults.",
  "Pets": "Not allowed",
  "Cancellation": "Free cancellation — no prepayment, pay at the hotel",
};

let ok = 0;
for (const [currentSlug, r] of Object.entries(rooms)) {
  const { data: existing, error: findErr } = await supabase
    .from("rooms")
    .select("id, slug, name")
    .eq("slug", currentSlug)
    .maybeSingle();

  if (findErr || !existing) {
    console.error(`✗ ${currentSlug}: not found (${findErr?.message ?? "no row"})`);
    continue;
  }

  const { error } = await supabase
    .from("rooms")
    .update({ ...r, good_to_know: goodToKnow })
    .eq("id", existing.id);

  if (error) {
    console.error(`✗ ${currentSlug}: ${error.message}`);
  } else {
    const renamed = existing.slug !== r.slug ? `  (renamed from "${existing.name}")` : "";
    console.log(`✓ ${r.name} — PKR ${r.price_per_night.toLocaleString()}${renamed}`);
    ok++;
  }
}

console.log(`\nDone: ${ok}/${Object.keys(rooms).length} rooms synced to Booking.com.`);

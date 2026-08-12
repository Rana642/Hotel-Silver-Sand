// Phase 4A setup: create the public storage bucket + seed rich room content.
// Run AFTER migration-phase4.sql:  node scripts/setup-rooms.mjs

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

// 1) storage bucket
const { error: bErr } = await supabase.storage.createBucket("room-images", {
  public: true,
  fileSizeLimit: "5MB",
});
if (bErr && !/already exists/i.test(bErr.message)) {
  console.error("bucket error:", bErr.message);
} else {
  console.log("✓ bucket room-images ready");
}

// 2) rich content per room (grounded, generic-but-real for this hotel)
const content = {
  "deluxe-king-room": {
    size_sqft: 300,
    view: "City View",
    description:
      "A comfortable king room with air conditioning, a smart TV and a private attached bathroom — ideal for business and solo travellers in Multan Cantt.",
    amenities: ["Air Conditioning", "High-Speed WiFi", "Mini Fridge", "Smart/Flat-screen TV", "Attached Private Bathroom", "Room Service", "Hot & Cold Water"],
    ideal_for: "Best for business travellers and couples staying in Multan Cantt.",
    why_book: [
      "Quiet, well-kept room close to Multan Cantt main road",
      "King-size premium bedding with a private attached bathroom",
      "Free high-speed WiFi throughout the hotel",
      "8 minutes from Multan International Airport",
      "24-hour front desk and room service",
    ],
    good_to_know: { "Check-in": "24 hours", "Check-out": "12:00 noon", "Breakfast": "Available on request", "Parking": "Free private parking on site", "WiFi": "Free in all areas", "Payment": "Cash / card accepted", "Advance payment": "None required to book" },
    nearby: [
      { place: "Multan International Airport", distance: "8 min", category: "Airport" },
      { place: "Multan Cantt Railway Station", distance: "Nearby", category: "Transport" },
      { place: "Aziz Hotel Chowk", distance: "Walking distance", category: "Landmark" },
      { place: "Shah Rukn-e-Alam Shrine", distance: "Short drive", category: "Attraction" },
    ],
    faqs: [
      { q: "How many guests can stay in the Deluxe King Room?", a: "It comfortably sleeps 2 adults on one king-size bed." },
      { q: "Is advance payment required?", a: "No. Payment is made at the hotel by cash or card at check-out." },
    ],
  },
  "deluxe-triple-room": {
    size_sqft: 320, view: "City View",
    description: "A spacious triple room for small families or groups, with AC, smart TV, mini fridge and a private attached bathroom.",
    amenities: ["Air Conditioning", "High-Speed WiFi", "Mini Fridge", "Smart/Flat-screen TV", "Attached Private Bathroom", "Room Service", "Hot & Cold Water"],
    ideal_for: "Best for small families and groups of up to three adults.",
    why_book: ["Sleeps up to 3 adults comfortably", "Air-conditioned with premium bedding", "Free WiFi and 24-hour room service", "Close to Multan Airport and Railway Station"],
    good_to_know: { "Check-in": "24 hours", "Check-out": "12:00 noon", "Breakfast": "Available on request", "Parking": "Free private parking on site", "WiFi": "Free in all areas", "Payment": "Cash / card accepted", "Advance payment": "None required to book" },
    nearby: [
      { place: "Multan International Airport", distance: "8 min", category: "Airport" },
      { place: "Multan Cantt Railway Station", distance: "Nearby", category: "Transport" },
      { place: "Aziz Hotel Chowk", distance: "Walking distance", category: "Landmark" },
    ],
    faqs: [{ q: "How many guests can stay?", a: "Up to 3 adults." }, { q: "Is advance payment required?", a: "No, pay at the hotel." }],
  },
  "executive-twin-room": {
    size_sqft: 340, view: "City View",
    description: "An executive twin room with separate beds, AC, smart TV and a private bathroom — great for colleagues or friends travelling together.",
    amenities: ["Air Conditioning", "High-Speed WiFi", "Mini Fridge", "Smart/Flat-screen TV", "Attached Private Bathroom", "Room Service", "Hot & Cold Water"],
    ideal_for: "Best for colleagues or friends who need separate beds.",
    why_book: ["Two comfortable single beds", "Air-conditioned executive room", "Free WiFi and room service", "Minutes from the airport and Cantt"],
    good_to_know: { "Check-in": "24 hours", "Check-out": "12:00 noon", "Breakfast": "Available on request", "Parking": "Free private parking on site", "WiFi": "Free in all areas", "Payment": "Cash / card accepted", "Advance payment": "None required to book" },
    nearby: [
      { place: "Multan International Airport", distance: "8 min", category: "Airport" },
      { place: "Multan Cantt Railway Station", distance: "Nearby", category: "Transport" },
    ],
    faqs: [{ q: "How many guests can stay?", a: "Up to 4 adults." }, { q: "Is advance payment required?", a: "No, pay at the hotel." }],
  },
  "executive-family-room": {
    size_sqft: 400, view: "City View",
    description: "Our largest room for families — sleeps 4 adults and 2 children, with AC, smart TV, mini fridge and a private attached bathroom.",
    amenities: ["Air Conditioning", "High-Speed WiFi", "Mini Fridge", "Smart/Flat-screen TV", "Attached Private Bathroom", "Room Service", "Hot & Cold Water", "Family-Friendly"],
    ideal_for: "Best for families travelling with children.",
    why_book: ["Sleeps 4 adults + 2 children", "Spacious, air-conditioned family room", "Free WiFi, parking and 24-hour reception", "8 minutes from Multan Airport"],
    good_to_know: { "Check-in": "24 hours", "Check-out": "12:00 noon", "Breakfast": "Available on request", "Parking": "Free private parking on site", "WiFi": "Free in all areas", "Payment": "Cash / card accepted", "Advance payment": "None required to book" },
    nearby: [
      { place: "Multan International Airport", distance: "8 min", category: "Airport" },
      { place: "Multan Cantt Railway Station", distance: "Nearby", category: "Transport" },
      { place: "Aziz Hotel Chowk", distance: "Walking distance", category: "Landmark" },
    ],
    faqs: [{ q: "How many guests can stay?", a: "4 adults and 2 children." }, { q: "Is advance payment required?", a: "No, pay at the hotel." }],
  },
};

for (const [slug, c] of Object.entries(content)) {
  const { error } = await supabase.from("rooms").update(c).eq("slug", slug);
  console.log(error ? `✗ ${slug}: ${error.message}` : `✓ seeded ${slug}`);
}

// 3) seed one image per room (existing SVG placeholders) into room_images
const { data: rooms } = await supabase.from("rooms").select("id, slug, image");
for (const r of rooms ?? []) {
  const { count } = await supabase.from("room_images").select("id", { count: "exact", head: true }).eq("room_id", r.id);
  if ((count ?? 0) === 0 && r.image) {
    await supabase.from("room_images").insert({ room_id: r.id, url: r.image, alt: r.slug, is_featured: true, sort_order: 0 });
    console.log(`✓ image row for ${r.slug}`);
  }
}

console.log("done.");

// Seed gallery_images from public/images/gallery + destinations.
// Run AFTER migration-phase4c.sql:  node scripts/setup-gallery-discover.mjs

import { readFileSync, readdirSync } from "node:fs";
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

// bucket for future admin uploads (gallery + destinations)
const { error: bErr } = await supabase.storage.createBucket("site-images", {
  public: true,
  fileSizeLimit: "8MB",
});
if (bErr && !/already exists/i.test(bErr.message)) console.error("bucket:", bErr.message);
else console.log("✓ bucket site-images ready");

// -- Gallery images (already in /public/images/gallery, referenced by relative URL)
const galleryDir = new URL("../public/images/gallery/", import.meta.url);
const files = readdirSync(galleryDir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));

const CATEGORIES = ["Exterior", "Reception", "Rooms", "Hallways", "Parking", "Surroundings"];
// simple spread: chunk files across categories in a stable order
const gallery = files.map((f, i) => ({
  url: `/images/gallery/${f}`,
  alt: `Hotel Silver Sand Multan — ${CATEGORIES[i % CATEGORIES.length]}`,
  category: CATEGORIES[i % CATEGORIES.length],
  is_visible: true,
  sort_order: i,
}));

const { count: existing } = await supabase
  .from("gallery_images")
  .select("id", { count: "exact", head: true });
if ((existing ?? 0) === 0 && gallery.length) {
  const { error } = await supabase.from("gallery_images").insert(gallery);
  console.log(error ? `✗ gallery: ${error.message}` : `✓ seeded ${gallery.length} gallery images`);
} else {
  console.log(`↷ gallery already has ${existing} rows — skipped seed`);
}

// -- Destinations (Discover Multan)
const destinations = [
  {
    slug: "shah-rukn-e-alam-shrine",
    title: "Shah Rukn-e-Alam Shrine",
    description:
      "One of Multan's most iconic landmarks — a masterpiece of medieval Islamic architecture famed for its towering dome and intricate blue-tiled work. A short drive from the hotel.",
    image: "/images/discover/shrine.svg",
    sort_order: 1,
  },
  {
    slug: "multan-blue-pottery",
    title: "Multan Blue Pottery",
    description:
      "Multan's signature blue pottery — hand-painted floral patterns in cobalt and turquoise. Perfect souvenirs reflecting centuries-old craftsmanship.",
    image: "/images/discover/pottery.svg",
    sort_order: 2,
  },
  {
    slug: "multani-mangoes",
    title: "Multani Mangoes",
    description:
      "Multan is Pakistan's mango capital, celebrated for its sweet, juicy Chaunsa and Sindhri varieties. Visiting in summer? Tasting fresh Multani mangoes is a must.",
    image: "/images/discover/mangoes.svg",
    sort_order: 3,
  },
];

for (const d of destinations) {
  const { error } = await supabase.from("destinations").upsert(d, { onConflict: "slug" });
  console.log(error ? `✗ ${d.slug}: ${error.message}` : `✓ ${d.slug}`);
}

console.log("done.");

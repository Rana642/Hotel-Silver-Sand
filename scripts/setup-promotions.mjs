// Seed starter promotions. Run AFTER migration-phase5.sql:
//   node scripts/setup-promotions.mjs

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

const promos = [
  {
    slug: "early-booking-offer",
    title: "Early Booking Offer",
    short_desc: "Plan ahead and save — book at least 7 days before check-in for extra savings.",
    description:
      "Planning your Multan trip in advance? Book your stay at Hotel Silver Sand at least 7 days before check-in and enjoy extra savings on our already affordable rates.\n\nWhether you're travelling for business or family, early planning means better rooms and better value. No advance payment required — simply reserve now and pay at the hotel.",
    image: "/images/gallery/851976912.jpg",
    badge: "Extra 10% Off",
    benefits: [
      "Book 7+ days before check-in",
      "No advance payment — pay at hotel",
      "Free high-speed WiFi & parking",
      "24-hour check-in",
    ],
    coupon_code: null,
    sort_order: 1,
  },
  {
    slug: "last-minute-deal",
    title: "Last Minute Deal",
    short_desc: "Sudden trip to Multan? Grab instant savings on last-minute bookings.",
    description:
      "Perfect for quick getaways or sudden business trips. Book your room close to your check-in date and still enjoy great value at Hotel Silver Sand, Multan Cantt.\n\nComfortable, air-conditioned rooms just 8 minutes from Multan International Airport — reserve on WhatsApp or by call and pay at the hotel.",
    image: "/images/gallery/851976923.jpg",
    badge: "Instant Savings",
    benefits: [
      "Great rates on last-minute stays",
      "Minutes from the airport & railway station",
      "Confirm instantly on WhatsApp",
      "No advance payment",
    ],
    coupon_code: null,
    sort_order: 2,
  },
  {
    slug: "long-stay-offer",
    title: "Long Stay Offer",
    short_desc: "Staying 3 nights or more? Enjoy 10% off plus extra perks.",
    description:
      "Stay 3 nights or more at Hotel Silver Sand, Multan and enjoy 10% off along with added comfort for a longer, relaxed stay.\n\nIdeal for families and business travellers who need a comfortable home base in Multan Cantt for a few days.",
    image: "/images/gallery/851976968.jpg",
    badge: "10% Off",
    benefits: [
      "10% off on stays of 3+ nights",
      "Book now & pay at the hotel",
      "Early check-in / late check-out (subject to availability)",
      "Free parking & 24/7 front desk",
    ],
    coupon_code: null,
    sort_order: 3,
  },
];

for (const p of promos) {
  const { error } = await supabase.from("promotions").upsert(p, { onConflict: "slug" });
  console.log(error ? `✗ ${p.slug}: ${error.message}` : `✓ ${p.slug}`);
}
console.log("done.");

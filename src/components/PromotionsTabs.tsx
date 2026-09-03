"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Promotion } from "@/lib/promotions";

const CATEGORY_ORDER = ["Early Bird", "Last Minute", "Long Stay", "Seasonal", "Special"] as const;

function categoryOf(p: Promotion): string {
  if (p.lead_time_type === "early_bird") return "Early Bird";
  if (p.lead_time_type === "last_minute") return "Last Minute";
  if ((p.min_nights ?? 0) > 0) return "Long Stay";
  if (p.start_date || p.end_date) return "Seasonal";
  return "Special";
}

export default function PromotionsTabs({ promos }: { promos: Promotion[] }) {
  const withCat = useMemo(() => promos.map((p) => ({ p, cat: categoryOf(p) })), [promos]);

  // Only show tabs for categories that actually exist, in a sensible order.
  const cats = useMemo(() => {
    const present = new Set(withCat.map((x) => x.cat));
    return ["All", ...CATEGORY_ORDER.filter((c) => present.has(c))];
  }, [withCat]);

  const [tab, setTab] = useState("All");
  const visible = tab === "All" ? withCat : withCat.filter((x) => x.cat === tab);

  return (
    <div>
      {/* Tabs */}
      {cats.length > 2 && (
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {cats.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setTab(c)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                tab === c ? "border-navy bg-navy text-white" : "border-gray-300 bg-white text-navy hover:border-gold"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(({ p, cat }) => (
          <article key={p.id} className="flex h-full flex-col overflow-hidden border border-gray-100 bg-white shadow-card transition hover:shadow-pop">
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-cream">
              {p.image && <Image src={p.image} alt={p.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />}
              {p.badge && <span className="absolute left-0 top-3 bg-gold px-3 py-1 text-xs font-bold text-navy-dark">{p.badge}</span>}
              <span className="absolute right-0 top-3 bg-navy/85 px-2.5 py-1 text-xs font-semibold text-white">{cat}</span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-heading text-lg font-bold text-navy">{p.title}</h3>
              {p.short_desc && <p className="mt-2 text-sm leading-relaxed text-slate">{p.short_desc}</p>}
              <Link href={`/promotions/${p.slug}`} className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-semibold text-navy hover:text-gold">
                More Info <ArrowRight className="size-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {visible.length === 0 && <p className="mt-10 text-center text-slate">No offers in this category right now.</p>}
    </div>
  );
}

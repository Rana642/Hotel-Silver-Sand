import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import { getPromotionsStatic } from "@/lib/promotions";
import { pageMeta } from "@/lib/seo";

export const revalidate = 60;

export const metadata = pageMeta({
  title: "Promotions & Special Offers in Multan",
  description:
    "Exclusive deals at Hotel Silver Sand Multan — early booking, last-minute and long-stay offers. Book direct and pay at the hotel.",
  path: "/promotions",
});

export default async function PromotionsPage() {
  const promos = await getPromotionsStatic();

  return (
    <>
      <PageHero title="Promotions" subtitle="Exclusive deals & special offers" />
      <section className="bg-cream">
        <div className="container-site py-14 sm:py-16">
          <SectionHeading title="Special Offers at Hotel Silver Sand" />

          {promos.length === 0 ? (
            <p className="mt-10 text-center text-slate">No active promotions right now — check back soon.</p>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {promos.map((p) => (
                <article key={p.id} className="flex h-full flex-col overflow-hidden border border-gray-100 bg-white shadow-card transition hover:shadow-pop">
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-cream">
                    {p.image && <Image src={p.image} alt={p.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />}
                    {p.badge && (
                      <span className="absolute left-0 top-3 bg-gold px-3 py-1 text-xs font-bold text-navy-dark">{p.badge}</span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-heading text-lg font-bold text-navy">{p.title}</h3>
                    {p.short_desc && <p className="mt-2 text-sm leading-relaxed text-slate">{p.short_desc}</p>}
                    <Link
                      href={`/promotions/${p.slug}`}
                      className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-semibold text-navy hover:text-gold"
                    >
                      More Info <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

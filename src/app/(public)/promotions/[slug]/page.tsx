import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ArrowLeft, TicketPercent } from "lucide-react";
import PromoBookButton from "@/components/PromoBookButton";
import { getPromotionsStatic, getPromotionBySlug } from "@/lib/promotions";
import { pageMeta } from "@/lib/seo";
import { site } from "@/data/site";

export const revalidate = 60;

export async function generateStaticParams() {
  const promos = await getPromotionsStatic();
  return promos.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const promo = await getPromotionBySlug(slug);
  if (!promo) return {};
  return pageMeta({
    title: `${promo.title} — ${site.name}`,
    description: promo.short_desc ?? `${promo.title} at ${site.name}, Multan.`,
    path: `/promotions/${promo.slug}`,
    absoluteTitle: true,
  });
}

export default async function PromotionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [promo, all] = await Promise.all([getPromotionBySlug(slug), getPromotionsStatic()]);
  if (!promo || !promo.is_active) notFound();

  const paras = (promo.description ?? "").split(/\n\s*\n/).filter(Boolean);
  const benefits = promo.benefits ?? [];

  return (
    <section className="bg-cream">
      <div className="container-site py-12 sm:py-16">
        <Link href="/promotions" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-gold">
          <ArrowLeft className="size-4" /> All Promotions
        </Link>

        {/* Switch between offers without going back to the listing */}
        {all.length > 1 && (
          <div className="mt-5 overflow-x-auto border-b border-gray-200">
            <div className="flex min-w-max justify-center gap-1 sm:gap-2">
              {all.map((p) => {
                const active = p.slug === promo.slug;
                return (
                  <Link
                    key={p.id}
                    href={`/promotions/${p.slug}`}
                    aria-current={active ? "page" : undefined}
                    className={`-mb-px whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${
                      active ? "border-gold text-navy" : "border-transparent text-slate hover:border-gold/40 hover:text-navy"
                    }`}
                  >
                    {p.title}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <h1 className="mt-6 text-center font-heading text-3xl font-bold text-navy sm:text-4xl">{promo.title}</h1>
        {promo.badge && (
          <p className="mt-2 text-center">
            <span className="inline-flex items-center gap-1 bg-gold px-3 py-1 text-sm font-bold text-navy-dark">
              <TicketPercent className="size-4" /> {promo.badge}
            </span>
          </p>
        )}

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-2">
          <div className="relative aspect-[4/3] w-full overflow-hidden border border-gray-100 bg-white shadow-card">
            {promo.image && <Image src={promo.image} alt={promo.title} fill priority sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />}
          </div>

          <div>
            {paras.map((p, i) => (
              <p key={i} className="mb-4 leading-relaxed text-slate">{p}</p>
            ))}

            {benefits.length > 0 && (
              <ul className="mt-2 space-y-2">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-navy">
                    <Check className="mt-0.5 size-4 shrink-0 text-gold" /> {b}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-7">
              <PromoBookButton coupon={promo.coupon_code} checkIn={promo.start_date} />
              {promo.coupon_code && (
                <p className="mt-2 text-xs text-slate">
                  Coupon <span className="font-semibold text-navy">{promo.coupon_code}</span> will be applied at booking.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ArrowLeft, TicketPercent, CalendarDays, Clock, Moon, ShieldCheck, BadgePercent } from "lucide-react";
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

  // Reflect the deal settings configured in the dashboard.
  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const fmtTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hh = h % 12 === 0 ? 12 : h % 12;
    return `${hh}:${String(m).padStart(2, "0")} ${ampm}`;
  };
  const discount = Number(promo.discount_percent) || 0;
  const days = (promo.weekdays ?? []).slice().sort();
  const facts: { icon: typeof Clock; text: string }[] = [];
  if (days.length > 0 && days.length < 7) {
    facts.push({ icon: CalendarDays, text: `Valid on ${days.map((d) => DAY_NAMES[d]).join(", ")} check-ins` });
  }
  if (promo.start_time && promo.end_time) {
    facts.push({ icon: Clock, text: `Bookings between ${fmtTime(promo.start_time)} – ${fmtTime(promo.end_time)} (PKT)` });
  }
  if ((promo.min_nights ?? 0) > 0) {
    facts.push({ icon: Moon, text: `Minimum stay ${promo.min_nights} nights` });
  }
  if (promo.lead_time_type === "early_bird") {
    facts.push({ icon: CalendarDays, text: `Book at least ${promo.lead_time_days ?? 0} days before check-in` });
  }
  if (promo.lead_time_type === "last_minute") {
    facts.push({ icon: CalendarDays, text: `Book within ${promo.lead_time_days ?? 0} day(s) of check-in` });
  }
  if (discount > 0) {
    facts.push({
      icon: ShieldCheck,
      text: promo.refundable
        ? `Free cancellation up to ${promo.free_cancel_days ?? 0} day(s) before check-in`
        : "Non-refundable rate",
    });
  }

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

            {discount > 0 && (
              <div className="mt-6 border border-gold/40 bg-white p-5 shadow-card">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 bg-gold px-3 py-1.5 font-heading text-xl font-bold text-navy-dark">
                    <BadgePercent className="size-5" /> {discount}% OFF
                  </span>
                  <span className="text-sm font-semibold text-navy">on room price — applied automatically</span>
                </div>
                {facts.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {facts.map(({ icon: Icon, text }) => (
                      <li key={text} className="flex items-start gap-2 text-sm text-slate">
                        <Icon className="mt-0.5 size-4 shrink-0 text-gold" /> {text}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-3 text-xs text-slate">No advance payment — pay at the hotel.</p>
              </div>
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

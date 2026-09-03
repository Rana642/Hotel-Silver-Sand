import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import PromotionsTabs from "@/components/PromotionsTabs";
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
            <PromotionsTabs promos={promos} />
          )}
        </div>
      </section>
    </>
  );
}

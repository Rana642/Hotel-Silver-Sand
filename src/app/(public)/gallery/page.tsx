import type { Metadata } from "next";
import { Youtube } from "@/components/BrandIcons";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import GalleryGrid from "@/components/GalleryGrid";
import { ButtonLink } from "@/components/Button";
import { videos, youtubeChannel } from "@/data/gallery";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Hotel Silver Sand Multan | Photo Gallery",
  description:
    "Browse photos of Hotel Silver Sand Multan — exterior, reception, hallways, rooms, parking and surroundings in Multan Cantt.",
  path: "/gallery",
  absoluteTitle: true,
});

export default function GalleryPage() {
  return (
    <>
      <PageHero title="Photo Gallery" subtitle="Explore our hotel through images" />

      <section className="bg-cream">
        <div className="container-site py-14 sm:py-16">
          <GalleryGrid />
        </div>
      </section>

      <section className="bg-white">
        <div className="container-site py-14 sm:py-16">
          <SectionHeading title="Video Gallery" subtitle="Experience our hotel through video" />
          {videos.length > 0 ? (
            <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
              {videos.map((v) => (
                <div
                  key={v.embedUrl}
                  className="overflow-hidden rounded-xl border border-gray-100 shadow-card"
                >
                  <iframe
                    src={v.embedUrl}
                    title={v.title}
                    loading="lazy"
                    allowFullScreen
                    className="aspect-video w-full"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="mx-auto mt-8 max-w-xl text-center text-slate">
              Video tour coming soon. In the meantime, follow us on social media for the latest
              clips and updates.
            </p>
          )}

          <div className="mt-12 text-center">
            <h3 className="font-heading text-xl font-bold text-navy">Shorts &amp; Reels</h3>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate">
              Follow us on social media for more short videos and updates.
            </p>
            <ButtonLink href={youtubeChannel} variant="gold" className="mt-6" external>
              <Youtube className="size-4" /> Visit Our YouTube Channel
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

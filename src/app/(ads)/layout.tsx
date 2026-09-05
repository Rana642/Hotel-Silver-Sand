import type { Metadata } from "next";
import Image from "next/image";
import BookingProvider from "@/components/BookingProvider";
import BookingBar from "@/components/BookingBar";
import { site } from "@/data/site";

// Paid-traffic landing pages: near-duplicates of content that already lives on
// the main site, built only so an ad click lands on a page with one job
// instead of a full navigation. Never index these — they'd just compete with
// the real pages for the same searches.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdsLayout({ children }: { children: React.ReactNode }) {
  return (
    <BookingProvider>
      {/* No nav links, nothing clickable except the logo mark itself — an ad
          click should have exactly one job: call, WhatsApp, or check dates. */}
      <div className="border-b border-gray-100 bg-white py-3">
        <div className="container-site flex items-center gap-3">
          <Image
            src="/images/logo-dark.png"
            alt=""
            width={40}
            height={40}
            className="size-9 shrink-0 rounded-full object-contain"
            priority
          />
          <span className="font-heading text-sm font-bold tracking-tight text-navy">
            {site.name}
          </span>
        </div>
      </div>

      <main className="flex-1 pb-[68px]">{children}</main>

      <BookingBar />
    </BookingProvider>
  );
}

import type { Metadata } from "next";
import Script from "next/script";
import { Montserrat, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { site } from "@/data/site";
import AttributionCapture from "@/components/AttributionCapture";

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID; // e.g. AW-123456789
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID; // e.g. G-XXXXXXXXXX
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

// Staff guard (mirrors lib/trackingGuard.ts): /admin loads no tracking and
// flags the browser internal; an internal browser is sent to GA4 tagged
// traffic_type=internal and never reaches Google Ads or Meta.
// ?hss_internal=0 clears the flag on a device.
const GUARD = `var hssAdmin=location.pathname.indexOf('/admin')===0,hssInternal=false;try{if(location.search.indexOf('hss_internal=0')>-1)localStorage.removeItem('hss_internal');if(hssAdmin)localStorage.setItem('hss_internal','1');hssInternal=localStorage.getItem('hss_internal')==='1';}catch(e){}`;

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["italic", "normal"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Hotel Silver Sand Multan | Affordable Hotel in Multan Cantt",
    template: "%s | Hotel Silver Sand Multan",
  },
  description:
    "Looking for a hotel in Multan? Hotel Silver Sand Multan offers clean, air-conditioned hotel rooms in Multan Cantt — free WiFi, free private parking and 24-hour check-in, a 500 m walk from Multan Cantt Railway Station. Book direct on WhatsApp or by call and pay at the hotel.",
  // Ordered by real Google Ads search volume for the Multan geo (Sep 2026).
  keywords: [
    "Hotel in Multan",
    "Hotels in Multan Pakistan",
    "Hotel room in Multan",
    "Hotel Silver Sand Multan",
    "Guest house in Multan",
    "Hotel in Multan Cantt",
    "Multan hotel booking",
    "Multan hotels low price",
    "Hotel near Multan Cantt Railway Station",
    "Hotel near Multan Airport",
  ],
  applicationName: site.name,
  authors: [{ name: site.name }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_PK",
    siteName: site.name,
    url: site.url,
    images: [{ url: "/images/hero.png", width: 1672, height: 941, alt: site.name }],
  },
  twitter: { card: "summary_large_image", images: ["/images/hero.png"] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${inter.variable} ${playfair.variable} antialiased`}
    >
      {/* Google Ads + GA4 — one direct gtag.js loader, configured for both IDs. */}
      {(GOOGLE_ADS_ID || GA4_ID) && (
        <>
          <Script
            id="gtag-lib"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID || GA4_ID}`}
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`${GUARD}if(!hssAdmin){window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=window.gtag||gtag;gtag('js',new Date());${
              GOOGLE_ADS_ID ? `if(!hssInternal)gtag('config','${GOOGLE_ADS_ID}');` : ""
            }${GA4_ID ? `gtag('config','${GA4_ID}',hssInternal?{traffic_type:'internal'}:{});` : ""}}`}
          </Script>
        </>
      )}
      {/* Meta Pixel — direct install so browser-side Contact/Lead signals
          reach Meta with no extra hop, matching the gtag calls above. */}
      {META_PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`${GUARD}if(!hssAdmin&&!hssInternal){!function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');}`}
        </Script>
      )}
      <body className="flex min-h-dvh flex-col bg-white">
        <AttributionCapture />
        {children}
      </body>
    </html>
  );
}

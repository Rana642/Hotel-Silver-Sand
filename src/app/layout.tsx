import type { Metadata } from "next";
import Script from "next/script";
import { Montserrat, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { site } from "@/data/site";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID; // e.g. AW-123456789

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
      {GTM_ID && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      )}
      {/* Google Ads — direct global site tag (independent of GTM/GA4 for fast conversion signals) */}
      {GOOGLE_ADS_ID && (
        <>
          <Script
            id="google-ads-lib"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
          />
          <Script id="google-ads-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=window.gtag||gtag;gtag('js',new Date());gtag('config','${GOOGLE_ADS_ID}');`}
          </Script>
        </>
      )}
      <body className="flex min-h-dvh flex-col bg-white">
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        {children}
      </body>
    </html>
  );
}

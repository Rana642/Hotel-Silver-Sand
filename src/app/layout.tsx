import type { Metadata } from "next";
import Script from "next/script";
import { Montserrat, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { site } from "@/data/site";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

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
    default: "Hotel Silver Sand Multan | Comfortable Hotel in Multan Cantt",
    template: "%s | Hotel Silver Sand Multan",
  },
  description:
    "Affordable, comfortable hotel in Multan Cantt since 1986. 8 minutes from Multan Airport, near the Railway Station. Book rooms directly by call or WhatsApp.",
  keywords: [
    "Hotel in Multan",
    "Hotel in Multan Cantt",
    "Affordable hotel in Multan",
    "Hotel near Multan Airport",
    "Hotel near Multan Railway Station",
    "Family hotel in Multan",
    "Business hotel in Multan",
  ],
  applicationName: site.name,
  authors: [{ name: site.name }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_PK",
    siteName: site.name,
    url: site.url,
    images: [{ url: "/images/og.svg", width: 1200, height: 630, alt: site.name }],
  },
  twitter: { card: "summary_large_image", images: ["/images/og.svg"] },
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

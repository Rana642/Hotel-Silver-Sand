import JsonLd from "@/components/JsonLd";
import { hotelSchema, websiteSchema } from "@/lib/seo";
import BookingProvider from "@/components/BookingProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookingBar from "@/components/BookingBar";
import ContinueBookingBanner from "@/components/ContinueBookingBanner";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={[hotelSchema, websiteSchema]} />
      <BookingProvider>
        <Header />
        <main className="flex-1 pb-[68px]">{children}</main>
        <Footer />
        <BookingBar />
        <ContinueBookingBanner />
      </BookingProvider>
    </>
  );
}

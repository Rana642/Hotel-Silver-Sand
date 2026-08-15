import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ManageBookingForm from "@/components/ManageBookingForm";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMeta({
    title: "Manage Your Booking",
    description: "Look up your Hotel Silver Sand Multan booking with your Booking ID and email or phone to view your confirmation details.",
    path: "/manage-booking",
    absoluteTitle: true,
  }),
  robots: { index: false, follow: true },
};

export default function ManageBookingPage() {
  return (
    <>
      <PageHero title="Manage Booking" subtitle="View your reservation details" />
      <section className="bg-cream">
        <div className="container-site py-14 sm:py-16">
          <p className="mx-auto mb-8 max-w-xl text-center text-slate">
            Enter your Booking ID (sent on your confirmation) and the email or phone number you booked
            with to view your reservation details.
          </p>
          <ManageBookingForm />
        </div>
      </section>
    </>
  );
}

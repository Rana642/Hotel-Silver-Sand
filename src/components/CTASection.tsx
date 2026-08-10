import { MessageCircle, ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import BookNowButton from "@/components/BookNowButton";
import { waLink } from "@/data/site";

export default function CTASection({
  title,
  text,
  showViewRooms = false,
}: {
  title: string;
  text: string;
  showViewRooms?: boolean;
}) {
  return (
    <section className="bg-navy-dark">
      <div className="container-site py-16 text-center sm:py-20">
        <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">{title}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-white/70">{text}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <BookNowButton variant="gold">Book Now</BookNowButton>
          <ButtonLink
            href={waLink("Hi, I'd like to enquire about a stay at Hotel Silver Sand Multan.")}
            variant="outline-light"
          >
            <MessageCircle className="size-4" /> WhatsApp
          </ButtonLink>
          {showViewRooms && (
            <ButtonLink href="/rooms" variant="outline-light">
              View Rooms <ArrowRight className="size-4" />
            </ButtonLink>
          )}
        </div>
      </div>
    </section>
  );
}

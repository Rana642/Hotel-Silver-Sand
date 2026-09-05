import { reviews as staticReviews, type Review } from "@/data/reviews";
import { googleRating as staticRating } from "@/data/hotel-facts";
import { site } from "@/data/site";

export type GoogleReviewData = { rating: number; count: number; reviews: Review[] };

const STATIC_FALLBACK: GoogleReviewData = {
  rating: staticRating.value,
  count: staticRating.count,
  reviews: staticReviews,
};

type PlacesApiReview = {
  rating?: number;
  text?: { text?: string };
  authorAttribution?: { displayName?: string };
  relativePublishTimeDescription?: string;
};

type PlacesApiResponse = {
  rating?: number;
  userRatingCount?: number;
  reviews?: PlacesApiReview[];
};

/**
 * Real reviews and rating pulled from the Places API (New), using the same
 * place ID as the map embed. Cached for a week — reviews don't change fast
 * enough to justify a fresh Places API call on every page render, and each
 * call has a real cost against the Google Cloud billing account.
 *
 * Falls back to the static snapshot in @/data/reviews and @/data/hotel-facts
 * on any failure (missing key, quota, network error) so the page never
 * breaks and never shows an empty reviews section.
 */
export async function getGoogleReviews(): Promise<GoogleReviewData> {
  // Deliberately NOT the NEXT_PUBLIC_ Maps key — that one is (correctly)
  // restricted to HTTP referrers for browser use, and a server-side call has
  // no referrer at all, so Google rejects it. This needs its own key,
  // restricted only to "Places API (New)" with no application restriction,
  // and never exposed to the client (no NEXT_PUBLIC_ prefix).
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return STATIC_FALLBACK;

  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${site.placeId}`, {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask":
          "rating,userRatingCount,reviews.rating,reviews.text,reviews.authorAttribution.displayName,reviews.relativePublishTimeDescription",
      },
      // A week: long enough to keep Places API cost negligible, short enough
      // that a real new review still shows up within a reasonable time.
      next: { revalidate: 60 * 60 * 24 * 7 },
    });

    if (!res.ok) return STATIC_FALLBACK;

    const data = (await res.json()) as PlacesApiResponse;
    const liveReviews = (data.reviews ?? [])
      .filter((r) => r.text?.text)
      .map((r): Review => {
        const name = r.authorAttribution?.displayName?.trim() || "Google User";
        return {
          name,
          initial: name.charAt(0).toUpperCase(),
          when: r.relativePublishTimeDescription ?? "",
          rating: r.rating ?? 5,
          text: r.text!.text!,
        };
      });

    return {
      rating: typeof data.rating === "number" ? data.rating : STATIC_FALLBACK.rating,
      count: typeof data.userRatingCount === "number" ? data.userRatingCount : STATIC_FALLBACK.count,
      reviews: liveReviews.length ? liveReviews : STATIC_FALLBACK.reviews,
    };
  } catch {
    return STATIC_FALLBACK;
  }
}

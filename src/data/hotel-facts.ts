/**
 * Single source of truth for the factual claims the website makes about the hotel:
 * policies, distances and the answers guests actually ask for.
 *
 * Every entry here is either published by the property on Booking.com
 * (see docs/booking-com-knowledge-base.md) or confirmed directly by the owner.
 * Nothing in this file is invented — if a fact is not verified, it does not go in.
 */

/**
 * The property's live Google Business Profile score, read from the GBP panel on
 * 2026-09-04. This is the rating the site is allowed to show and mark up: it is
 * public, attributed to Google, and displayed on the page next to the claim.
 *
 * For context on why this and not Booking.com's number: Booking.com shows 6.2
 * from 19 reviews, Google 3.8 from 837. The Google sample is 44x larger, so it
 * is the honest headline figure.
 */
export const googleRating = {
  value: 3.8,
  count: 837,
  scale: 5,
  /** Where a visitor can verify it for themselves. */
  source: "Google",
};

export type Policy = { label: string; value: string; note?: string };

/** House rules exactly as the property publishes them on Booking.com. */
export const housePolicies: Policy[] = [
  {
    label: "Check-in",
    value: "Available 24 hours",
    note: "Arrive on a night train or a delayed flight — the front desk is always staffed.",
  },
  { label: "Check-out", value: "12:00 – 13:00" },
  {
    label: "Cancellation",
    value: "Free cancellation",
    note: "No prepayment needed — you pay at the hotel.",
  },
  { label: "Payment", value: "Cash accepted at the property" },
  {
    label: "Children",
    value: "All ages welcome",
    note: "Children aged 3 and above are charged as adults.",
  },
  {
    label: "Extra bed",
    value: "PKR 1,000 per child, per night",
    note: "For children 0–12, on request. Cots are not available.",
  },
  { label: "Pets", value: "Not allowed" },
  { label: "Parties or events", value: "Not allowed" },
];

export type Distance = { place: string; distance: string; note?: string };

/** Distances as calculated by Booking.com / OpenStreetMap from the property. */
export const distances: Distance[] = [
  { place: "Multan Cantt Railway Station", distance: "500 m", note: "About a 6-minute walk" },
  { place: "Multan International Airport", distance: "2.4 km", note: "About 8 minutes by car" },
  { place: "Multan city centre (Ghanta Ghar)", distance: "~3 km", note: "About 10 minutes by car" },
  { place: "Multan City Railway Station", distance: "3.8 km" },
  { place: "Nearest restaurant (Babar Murg Plao)", distance: "700 m" },
];

export type Faq = { q: string; a: string };

/**
 * The 12 questions guests actually ask on the Booking.com listing, answered
 * honestly — including the four honest "no"s. Answering "no" plainly beats a
 * guest discovering it at the front desk.
 */
export const faqs: Faq[] = [
  {
    q: "What are the check-in and check-out times at Hotel Silver Sand Multan?",
    a: "Check-in is available 24 hours a day — there is no cut-off, so a late train or a delayed flight is never a problem. Check-out is between 12:00 and 13:00. If you need to leave very early, tell the front desk the night before and we will have everything ready.",
  },
  {
    q: "Is breakfast included?",
    a: "Yes. Breakfast is included in your room rate at no extra charge, for every room type.",
  },
  {
    q: "Can I park at the hotel?",
    a: "Yes — free private parking is available on site, at no extra cost and with no booking needed. The parking is inside the property, not on the street.",
  },
  {
    q: "Is there an airport pick-up and drop service?",
    a: "Yes. We arrange airport pick-up and drop on request. It is a chargeable service, so please tell us your flight number and arrival time when you book and we will confirm the fare in advance. Multan International Airport is only 2.4 km away, about 8 minutes by car.",
  },
  {
    q: "How far is the hotel from Multan Cantt Railway Station?",
    a: "500 metres — roughly a 6-minute walk with your luggage. It is the closest comfortable, affordable hotel to the Cantt station, which is why guests arriving on night trains choose us.",
  },
  {
    q: "How far is the hotel from the centre of Multan?",
    a: "About 3 km, roughly a 10-minute drive to Ghanta Ghar and the old city bazaars. The hotel is in Multan Cantt, which is quieter than the city centre but still close to it.",
  },
  {
    q: "Is there a restaurant at the hotel?",
    a: "No, we do not have our own restaurant — but room service is available and breakfast is included. There are places to eat within a short walk, the nearest being about 700 metres away, and the front desk will happily point you to the ones locals actually go to.",
  },
  {
    q: "Is there a swimming pool or a spa?",
    a: "No. Hotel Silver Sand is a comfortable, affordable hotel rather than a resort — there is no swimming pool and no spa. What we do put our money into is clean, air-conditioned, soundproofed rooms, free WiFi that genuinely works, free parking and a front desk that answers at 3 a.m.",
  },
  {
    q: "Do the rooms have a private bathroom?",
    a: "Yes. Every room has its own private attached bathroom with hot and cold water, a shower and free toiletries. No bathroom is shared.",
  },
  {
    q: "Are there rooms with a balcony?",
    a: "Yes. The Deluxe King Room and the Deluxe Triple Room both have a balcony and access to the terrace, with a view over the city. Mention it when you book and we will hold one for you.",
  },
  {
    q: "Is the hotel good for families?",
    a: "Yes. The Deluxe Triple Room sleeps three adults in real beds, and extra beds are available for children aged 0–12 at PKR 1,000 per child per night. Children of all ages are welcome; those aged 3 and above are charged as adults.",
  },
  {
    q: "What is nearby, and how do I get around?",
    a: "Multan Cantt Railway Station is 500 m away and the airport is 2.4 km. From the Cantt area you can reach the city centre in about 10 minutes by car, and rickshaws and ride-hailing cars are easy to find outside the hotel at any hour. The front desk can arrange a car for you.",
  },
];

/** Things the hotel genuinely does not have. Saying so plainly protects the review score. */
export const notAvailable = ["Swimming pool", "Spa", "On-site restaurant", "Cots for infants"];

export type Review = {
  name: string;
  initial: string;
  when: string;
  rating: number;
  text: string;
};

/* Guest reviews as shown on the live site's Google reviews widget. */
export const reviews: Review[] = [
  {
    name: "Elegant PakNET",
    initial: "E",
    when: "1 month ago",
    rating: 5,
    text: "Best neat & clean rooms, service is perfect and staff very nice.",
  },
  {
    name: "Lee Statutes",
    initial: "L",
    when: "1 month ago",
    rating: 5,
    text: "Best hotel in Multan. I have over year, whenever we come from Karachi we prefer Hotel Silver Sand.",
  },
  {
    name: "Sis Sena",
    initial: "S",
    when: "1 month ago",
    rating: 5,
    text: "Luxury and comfortable stay with great hospitality.",
  },
  {
    name: "Muhammad Imran",
    initial: "M",
    when: "1 month ago",
    rating: 5,
    text: "Nice and comfortable. Great value for money in Multan Cantt.",
  },
];

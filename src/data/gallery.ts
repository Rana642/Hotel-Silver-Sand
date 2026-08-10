export type GalleryCategory =
  | "Exterior"
  | "Reception"
  | "Hallways"
  | "Rooms"
  | "Parking"
  | "Surroundings";

export const galleryCategories: GalleryCategory[] = [
  "Exterior",
  "Reception",
  "Hallways",
  "Rooms",
  "Parking",
  "Surroundings",
];

export type GalleryImage = {
  src: string;
  alt: string;
  category: GalleryCategory;
};

export const gallery: GalleryImage[] = [
  { src: "/images/gallery/exterior-1.svg", alt: "Hotel Silver Sand Multan front entrance", category: "Exterior" },
  { src: "/images/gallery/rooms-1.svg", alt: "Comfortable guest room with fresh linen", category: "Rooms" },
  { src: "/images/gallery/rooms-2.svg", alt: "King bed with crisp white bedding", category: "Rooms" },
  { src: "/images/gallery/exterior-2.svg", alt: "Hotel exterior with greenery", category: "Exterior" },
  { src: "/images/gallery/reception-1.svg", alt: "Guests at the reception desk", category: "Reception" },
  { src: "/images/gallery/reception-2.svg", alt: "Front desk staff assisting a guest", category: "Reception" },
  { src: "/images/gallery/surroundings-1.svg", alt: "Street view near the hotel in Multan Cantt", category: "Surroundings" },
  { src: "/images/gallery/hallways-1.svg", alt: "Clean, well-lit hallway", category: "Hallways" },
  { src: "/images/gallery/parking-1.svg", alt: "On-site secure parking", category: "Parking" },
  { src: "/images/gallery/hallways-2.svg", alt: "Corridor leading to guest rooms", category: "Hallways" },
  { src: "/images/gallery/rooms-3.svg", alt: "Twin bed room with wooden furniture", category: "Rooms" },
  { src: "/images/gallery/surroundings-2.svg", alt: "Neighbourhood around the hotel", category: "Surroundings" },
];

export type VideoItem = { title: string; embedUrl: string };

/* Replace embedUrl with the hotel's real YouTube video embeds. */
export const videos: VideoItem[] = [];

export const youtubeChannel = "https://youtube.com/";

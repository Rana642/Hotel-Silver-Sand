import {
  Wifi,
  Wind,
  Refrigerator,
  Utensils,
  Tv,
  Droplets,
  ParkingCircle,
  ShieldCheck,
  Clock,
  Users,
  Sparkles,
  Volume2,
  Trees,
  Store,
  Plane,
  Accessibility,
  CigaretteOff,
  type LucideIcon,
} from "lucide-react";

export type Amenity = {
  icon: LucideIcon;
  title: string;
  description?: string;
};

/* Home page — Premium Amenities grid */
export const amenities: Amenity[] = [
  { icon: Wifi, title: "Free WiFi", description: "High-speed internet throughout the hotel" },
  { icon: Wind, title: "Air Conditioning", description: "Climate-controlled comfort in all rooms" },
  { icon: Refrigerator, title: "Mini Fridge", description: "Keep your beverages and snacks fresh" },
  { icon: Utensils, title: "Room Service", description: "Meals delivered any time of day" },
  { icon: Tv, title: "Smart TV", description: "Entertainment with premium channels" },
  { icon: Droplets, title: "Hot & Cold Water", description: "Round-the-clock water supply" },
  { icon: ParkingCircle, title: "Free Parking", description: "Secure parking for all guests" },
  { icon: ShieldCheck, title: "24/7 CCTV", description: "Complete security by surveillance" },
  { icon: Clock, title: "24-Hour Front Desk", description: "Always here to assist you" },
  { icon: Users, title: "Family Rooms", description: "Extra beds available for children" },
  { icon: Sparkles, title: "Daily Housekeeping", description: "Clean, well-kept rooms every day" },
  { icon: Volume2, title: "Soundproofed Rooms", description: "Sleep through street and station noise" },
  { icon: Trees, title: "Garden & Terrace", description: "Outdoor seating to sit out in the evening" },
  { icon: Plane, title: "Airport Pick & Drop", description: "Shuttle on request (chargeable)" },
  { icon: Store, title: "Mini Market", description: "Snacks and essentials without leaving" },
  { icon: CigaretteOff, title: "Non-Smoking Rooms", description: "Fresh, smoke-free rooms available" },
  { icon: Accessibility, title: "Accessible Facilities", description: "Support for guests with limited mobility" },
];

/* Facilities page — feature cards */
export const facilities: Amenity[] = [
  {
    icon: Wifi,
    title: "Free High-Speed WiFi",
    description:
      "Stay connected with complimentary high-speed internet access throughout the hotel, perfect for both business and leisure travelers.",
  },
  {
    icon: Wind,
    title: "Air Conditioning",
    description:
      "All rooms feature individual climate control systems to ensure your comfort regardless of the weather outside.",
  },
  {
    icon: Refrigerator,
    title: "Mini Fridge",
    description:
      "Keep your beverages and snacks fresh with an in-room mini refrigerator available in all our rooms.",
  },
  {
    icon: Utensils,
    title: "24/7 Room Service",
    description:
      "Enjoy delicious meals and refreshments delivered to your room at any time of day or night.",
  },
  {
    icon: Tv,
    title: "Smart/Flat-screen TV",
    description:
      "Entertainment at your fingertips with modern flat-screen TVs featuring premium channels and streaming capabilities.",
  },
  {
    icon: Droplets,
    title: "Hot & Cold Water",
    description:
      "Round-the-clock hot and cold water supply in all attached private bathrooms for your convenience.",
  },
];

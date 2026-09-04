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

/**
 * Facilities page — feature cards.
 * Every item below is a facility the property publishes on Booking.com.
 * Nothing here is aspirational; see docs/booking-com-knowledge-base.md.
 */
export const facilities: Amenity[] = [
  {
    icon: Wifi,
    title: "Free WiFi — Rated 10/10",
    description:
      "Our guests score the WiFi a perfect 10 out of 10 on Booking.com, and it is free in every room and throughout the hotel. Join a call, upload the files, stream what you want.",
  },
  {
    icon: Wind,
    title: "Air Conditioning in Every Room",
    description:
      "Multan summers are not gentle. Every room has its own air conditioning, so you decide how cool the room gets — not a thermostat in some corridor.",
  },
  {
    icon: Volume2,
    title: "Soundproofed Rooms",
    description:
      "The rooms are soundproofed. You are 500 metres from Multan Cantt Railway Station and you will still sleep through the night — which is the entire reason people book a hotel this close to a station.",
  },
  {
    icon: ParkingCircle,
    title: "Free Private Parking On Site",
    description:
      "Parking is free, inside the property, and needs no reservation. Your car sits behind our gate, not on Akbar Road.",
  },
  {
    icon: Clock,
    title: "24-Hour Front Desk",
    description:
      "There is no check-in cut-off here. Arrive at 2 a.m. off a delayed train and someone will be awake, at the desk, with your key.",
  },
  {
    icon: Plane,
    title: "Airport Pick-up & Drop",
    description:
      "The airport is 2.4 km away, about eight minutes. Send us your flight number and we will have a car waiting. The service is chargeable and we confirm the fare before you travel.",
  },
  {
    icon: Utensils,
    title: "Room Service & Breakfast Included",
    description:
      "Breakfast is included in your rate, and room service brings meals to your door. We have no restaurant of our own — but the front desk knows exactly where locals eat nearby.",
  },
  {
    icon: Trees,
    title: "Garden, Terrace & Balconies",
    description:
      "A garden and terrace to sit out in when the evening finally cools down, and balconies on the Deluxe King and Deluxe Triple rooms.",
  },
  {
    icon: Droplets,
    title: "Private Attached Bathrooms",
    description:
      "Every room has its own attached bathroom with hot and cold water around the clock, a shower and free toiletries. Nothing is shared.",
  },
  {
    icon: Tv,
    title: "Flat-screen TV & Refrigerator",
    description:
      "A flat-screen TV with satellite channels and a refrigerator in every room, so your water stays cold and your medicines stay safe.",
  },
  {
    icon: Store,
    title: "Minimarket On Site",
    description:
      "Snacks, water and the small things you forgot to pack — available without stepping outside the gate.",
  },
  {
    icon: Users,
    title: "Family Rooms & Extra Beds",
    description:
      "The Deluxe Triple sleeps three adults in real beds, and extra beds for children aged 0–12 are PKR 1,000 per child per night. Children of every age are welcome.",
  },
  {
    icon: Accessibility,
    title: "Facilities for Guests With Limited Mobility",
    description:
      "Accessible facilities are available. Tell us what you need when you book and we will put you in the room that suits you best.",
  },
  {
    icon: CigaretteOff,
    title: "Non-Smoking Rooms",
    description:
      "Non-smoking rooms are available on request — ask for one at the time of booking and we will set it aside.",
  },
  {
    icon: ShieldCheck,
    title: "Private Check-in & Check-out",
    description:
      "Private check-in and check-out, plus concierge service, for guests who would rather not do their arrival in a crowded lobby.",
  },
];

import { createServiceClient } from "@/lib/supabase/service";

export type RoomImage = { url: string; alt: string | null; is_featured: boolean; sort_order: number };

export type DbRoom = {
  id: string;
  slug: string;
  name: string;
  capacity: string | null;
  max_adults: number;
  max_children: number;
  price_per_night: number;
  original_price: number | null;
  gst_percent: number;
  size_sqft: number | null;
  view: string | null;
  description: string | null;
  amenities: string[] | null;
  ideal_for: string | null;
  why_book: string[] | null;
  good_to_know: Record<string, string> | null;
  nearby: { place: string; distance: string; category: string }[] | null;
  faqs: { q: string; a: string }[] | null;
  is_active: boolean;
  sort_order: number;
  room_images: RoomImage[];
};

const SELECT =
  "id, slug, name, capacity, max_adults, max_children, price_per_night, original_price, gst_percent, size_sqft, view, description, amenities, ideal_for, why_book, good_to_know, nearby, faqs, is_active, sort_order, room_images(url, alt, is_featured, sort_order)";

/** Cookie-free fetchers (service client) so pages can use ISR without going dynamic. */
export async function getRoomsStatic(): Promise<DbRoom[]> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("rooms").select(SELECT).eq("is_active", true).order("sort_order");
  return sortImages((data ?? []) as DbRoom[]);
}

export async function getRoomBySlugStatic(slug: string): Promise<DbRoom | null> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("rooms").select(SELECT).eq("slug", slug).maybeSingle();
  if (!data) return null;
  return sortImages([data as DbRoom])[0];
}

function sortImages(rooms: DbRoom[]) {
  for (const r of rooms) {
    r.room_images = (r.room_images ?? []).sort(
      (a, b) => Number(b.is_featured) - Number(a.is_featured) || a.sort_order - b.sort_order
    );
  }
  return rooms;
}

export function roomPricing(room: Pick<DbRoom, "price_per_night" | "original_price" | "gst_percent">) {
  const price = Number(room.price_per_night) || 0;
  const original = room.original_price && room.original_price > price ? Number(room.original_price) : null;
  const discountPct = original ? Math.round(((original - price) / original) * 100) : 0;
  const gst = Math.round((price * (Number(room.gst_percent) || 0)) / 100);
  return { price, original, discountPct, gst };
}

export function featuredImage(room: DbRoom) {
  return room.room_images?.[0]?.url ?? "/images/rooms/deluxe-king.svg";
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/app/actions/activity";

type Res = { ok: true; id?: string } | { ok: false; error: string };

export type RoomInput = {
  slug: string;
  name: string;
  capacity: string;
  max_adults: number;
  max_children: number;
  price_per_night: number;
  original_price: number | null;
  gst_percent: number;
  size_sqft: number | null;
  view: string;
  description: string;
  amenities: string[];
  ideal_for: string;
  why_book: string[];
  good_to_know: Record<string, string>;
  nearby: { place: string; distance: string; category: string }[];
  faqs: { q: string; a: string }[];
  is_active: boolean;
  sort_order: number;
};

export async function upsertRoom(id: string | null, input: RoomInput): Promise<Res> {
  const supabase = await createClient();
  const payload = { ...input, slug: input.slug.trim().toLowerCase() };

  if (id) {
    const { error } = await supabase.from("rooms").update(payload).eq("id", id);
    if (error) return { ok: false, error: error.message };
    await logActivity("room.update", "room", id, input.name);
    revalidatePath("/admin/rooms");
    revalidatePath(`/admin/rooms/${id}`);
    return { ok: true, id };
  }

  const { data, error } = await supabase.from("rooms").insert(payload).select("id").single();
  if (error) return { ok: false, error: error.message };
  await logActivity("room.create", "room", data.id, input.name);
  revalidatePath("/admin/rooms");
  return { ok: true, id: data.id };
}

export async function deleteRoom(id: string): Promise<Res> {
  const supabase = await createClient();
  const { error } = await supabase.from("rooms").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  await logActivity("room.delete", "room", id);
  revalidatePath("/admin/rooms");
  return { ok: true };
}

export async function addRoomImage(roomId: string, url: string, alt: string): Promise<Res> {
  const supabase = await createClient();
  const { count } = await supabase.from("room_images").select("id", { count: "exact", head: true }).eq("room_id", roomId);
  const { error } = await supabase.from("room_images").insert({
    room_id: roomId,
    url,
    alt,
    is_featured: (count ?? 0) === 0,
    sort_order: count ?? 0,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/rooms/${roomId}`);
  return { ok: true };
}

export async function deleteRoomImage(id: string, roomId: string): Promise<Res> {
  const supabase = await createClient();
  const { error } = await supabase.from("room_images").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/rooms/${roomId}`);
  return { ok: true };
}

export async function setFeaturedImage(id: string, roomId: string): Promise<Res> {
  const supabase = await createClient();
  await supabase.from("room_images").update({ is_featured: false }).eq("room_id", roomId);
  const { error } = await supabase.from("room_images").update({ is_featured: true }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/rooms/${roomId}`);
  return { ok: true };
}

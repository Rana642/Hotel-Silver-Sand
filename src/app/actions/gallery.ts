"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/app/actions/activity";

type Res = { ok: true } | { ok: false; error: string };

export async function addGalleryImage(url: string, category: string, alt: string): Promise<Res> {
  const supabase = await createClient();
  const { count } = await supabase.from("gallery_images").select("id", { count: "exact", head: true });
  const { error } = await supabase.from("gallery_images").insert({
    url, category, alt: alt || null, sort_order: count ?? 0, is_visible: true,
  });
  if (error) return { ok: false, error: error.message };
  await logActivity("gallery.add", "gallery", url, category);
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { ok: true };
}

export async function updateGalleryImage(id: string, patch: { category?: string; is_visible?: boolean; alt?: string }): Promise<Res> {
  const supabase = await createClient();
  const { error } = await supabase.from("gallery_images").update(patch).eq("id", id);
  if (error) return { ok: false, error: error.message };
  await logActivity("gallery.update", "gallery", id);
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { ok: true };
}

export async function deleteGalleryImage(id: string): Promise<Res> {
  const supabase = await createClient();
  const { error } = await supabase.from("gallery_images").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  await logActivity("gallery.delete", "gallery", id);
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { ok: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/app/actions/activity";

type Res = { ok: true } | { ok: false; error: string };

export async function addHeroImage(url: string, alt: string): Promise<Res> {
  const supabase = await createClient();
  const { count } = await supabase.from("hero_images").select("id", { count: "exact", head: true });
  const { error } = await supabase.from("hero_images").insert({ url, alt: alt || null, sort_order: count ?? 0 });
  if (error) return { ok: false, error: error.message };
  await logActivity("hero.add", "hero", url);
  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteHeroImage(id: string): Promise<Res> {
  const supabase = await createClient();
  const { error } = await supabase.from("hero_images").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  await logActivity("hero.delete", "hero", id);
  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { ok: true };
}

export async function toggleHeroImage(id: string, is_active: boolean): Promise<Res> {
  const supabase = await createClient();
  const { error } = await supabase.from("hero_images").update({ is_active }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { ok: true };
}

export async function moveHeroImage(id: string, dir: -1 | 1): Promise<Res> {
  const supabase = await createClient();
  const { data: all } = await supabase.from("hero_images").select("id, sort_order").order("sort_order");
  const list = all ?? [];
  const idx = list.findIndex((r) => r.id === id);
  const swap = idx + dir;
  if (idx < 0 || swap < 0 || swap >= list.length) return { ok: true };
  const a = list[idx], b = list[swap];
  await supabase.from("hero_images").update({ sort_order: b.sort_order }).eq("id", a.id);
  await supabase.from("hero_images").update({ sort_order: a.sort_order }).eq("id", b.id);
  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { ok: true };
}

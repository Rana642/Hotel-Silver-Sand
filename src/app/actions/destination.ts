"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/app/actions/activity";

type Res = { ok: true } | { ok: false; error: string };

export type DestinationInput = {
  slug: string;
  title: string;
  description: string;
  image: string | null;
  is_active: boolean;
  sort_order: number;
};

export async function upsertDestination(id: string | null, input: DestinationInput): Promise<Res> {
  const supabase = await createClient();
  const payload = { ...input, slug: input.slug.trim().toLowerCase() };
  const q = id
    ? supabase.from("destinations").update(payload).eq("id", id)
    : supabase.from("destinations").insert(payload);
  const { error } = await q;
  if (error) return { ok: false, error: error.message };
  await logActivity(id ? "destination.update" : "destination.create", "destination", id ?? input.slug, input.title);
  revalidatePath("/admin/discover");
  revalidatePath("/discover-multan");
  return { ok: true };
}

export async function deleteDestination(id: string): Promise<Res> {
  const supabase = await createClient();
  const { error } = await supabase.from("destinations").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  await logActivity("destination.delete", "destination", id);
  revalidatePath("/admin/discover");
  revalidatePath("/discover-multan");
  return { ok: true };
}

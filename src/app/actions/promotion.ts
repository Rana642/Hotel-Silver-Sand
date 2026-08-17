"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/app/actions/activity";

type Res = { ok: true } | { ok: false; error: string };

export type PromotionInput = {
  slug: string;
  title: string;
  short_desc: string;
  description: string;
  image: string | null;
  badge: string;
  benefits: string[];
  coupon_code: string | null;
  is_active: boolean;
  sort_order: number;
};

export async function upsertPromotion(id: string | null, input: PromotionInput): Promise<Res> {
  const supabase = await createClient();
  const payload = { ...input, slug: input.slug.trim().toLowerCase() };
  const q = id
    ? supabase.from("promotions").update(payload).eq("id", id)
    : supabase.from("promotions").insert(payload);
  const { error } = await q;
  if (error) return { ok: false, error: error.message };
  await logActivity(id ? "promotion.update" : "promotion.create", "promotion", id ?? input.slug, input.title);
  revalidatePath("/admin/promotions");
  revalidatePath("/promotions");
  revalidatePath(`/promotions/${payload.slug}`);
  return { ok: true };
}

export async function deletePromotion(id: string): Promise<Res> {
  const supabase = await createClient();
  const { error } = await supabase.from("promotions").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  await logActivity("promotion.delete", "promotion", id);
  revalidatePath("/admin/promotions");
  revalidatePath("/promotions");
  return { ok: true };
}

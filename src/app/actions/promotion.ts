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
  // Optional "deal" fields — when discount_percent > 0 and dates are set, this
  // promotion auto-applies as a discount on /reservations for those check-in dates.
  discount_percent: number;
  start_date: string | null;
  end_date: string | null;
  room_ids: string[]; // empty = all rooms
  refundable: boolean;
  free_cancel_days: number;
  priority: number;
};

export async function upsertPromotion(id: string | null, input: PromotionInput): Promise<Res> {
  const supabase = await createClient();
  const payload = {
    ...input,
    slug: input.slug.trim().toLowerCase(),
    discount_percent: Math.max(0, Math.min(90, Number(input.discount_percent) || 0)),
    start_date: input.start_date || null,
    end_date: input.end_date || null,
    room_ids: Array.isArray(input.room_ids) ? input.room_ids : [],
    free_cancel_days: Math.max(0, Math.floor(Number(input.free_cancel_days) || 0)),
    priority: Math.floor(Number(input.priority) || 0),
  };
  if (payload.start_date && payload.end_date && payload.end_date < payload.start_date) {
    return { ok: false, error: "Deal end date must be on or after the start date." };
  }
  const q = id
    ? supabase.from("promotions").update(payload).eq("id", id)
    : supabase.from("promotions").insert(payload);
  const { error } = await q;
  if (error) return { ok: false, error: error.message };
  await logActivity(id ? "promotion.update" : "promotion.create", "promotion", id ?? input.slug, input.title);
  revalidatePath("/admin/promotions");
  revalidatePath("/promotions");
  revalidatePath(`/promotions/${payload.slug}`);
  revalidatePath("/reservations");
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

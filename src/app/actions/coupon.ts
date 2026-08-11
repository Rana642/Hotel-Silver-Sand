"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/app/actions/activity";

export type CouponPreview =
  | { valid: true; discount: number }
  | { valid: false; message: string };

/** Public — called from the booking form to preview a coupon (no increment). */
export async function previewCoupon(code: string, total: number): Promise<CouponPreview> {
  if (!code.trim()) return { valid: false, message: "Enter a coupon code." };
  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc("preview_coupon", { p_code: code.trim(), p_total: total });
  const row = Array.isArray(data) ? data[0] : data;
  if (error || !row) return { valid: false, message: "Could not check coupon." };
  return row.valid
    ? { valid: true, discount: Number(row.discount) }
    : { valid: false, message: row.message };
}

// ---------- Admin CRUD ----------
type Res = { ok: true } | { ok: false; error: string };

export type CouponInput = {
  code: string;
  discount_type: "percent" | "fixed";
  value: number;
  min_booking: number;
  max_uses: number | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
};

export async function createCoupon(input: CouponInput): Promise<Res> {
  const supabase = await createClient();
  const { error } = await supabase.from("coupons").insert({
    code: input.code.trim().toUpperCase(),
    discount_type: input.discount_type,
    value: input.value,
    min_booking: input.min_booking,
    max_uses: input.max_uses,
    starts_at: input.starts_at,
    ends_at: input.ends_at,
    is_active: input.is_active,
  });
  if (error) return { ok: false, error: error.message };
  await logActivity("coupon.create", "coupon", input.code.trim().toUpperCase());
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function updateCoupon(id: string, input: Partial<CouponInput>): Promise<Res> {
  const supabase = await createClient();
  const patch: Record<string, unknown> = { ...input };
  if (typeof input.code === "string") patch.code = input.code.trim().toUpperCase();
  const { error } = await supabase.from("coupons").update(patch).eq("id", id);
  if (error) return { ok: false, error: error.message };
  await logActivity("coupon.update", "coupon", id);
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function deleteCoupon(id: string): Promise<Res> {
  const supabase = await createClient();
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  await logActivity("coupon.delete", "coupon", id);
  revalidatePath("/admin/coupons");
  return { ok: true };
}

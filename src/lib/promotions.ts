import { createServiceClient } from "@/lib/supabase/service";

export type Promotion = {
  id: string;
  slug: string;
  title: string;
  short_desc: string | null;
  description: string | null;
  image: string | null;
  badge: string | null;
  benefits: string[] | null;
  coupon_code: string | null;
  is_active: boolean;
  sort_order: number;
  start_date: string | null;
  end_date: string | null;
  lead_time_type: "none" | "early_bird" | "last_minute" | null;
  lead_time_days: number | null;
  min_nights: number | null;
  discount_percent: number | null;
  weekdays: number[] | null;
  start_time: string | null;
  end_time: string | null;
  refundable: boolean | null;
  free_cancel_days: number | null;
};

const SELECT =
  "id, slug, title, short_desc, description, image, badge, benefits, coupon_code, is_active, sort_order, start_date, end_date, lead_time_type, lead_time_days, min_nights, discount_percent, weekdays, start_time, end_time, refundable, free_cancel_days";

export async function getPromotionsStatic(): Promise<Promotion[]> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("promotions").select(SELECT).eq("is_active", true).order("sort_order");
  return (data ?? []) as Promotion[];
}

export async function getPromotionBySlug(slug: string): Promise<Promotion | null> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("promotions").select(SELECT).eq("slug", slug).maybeSingle();
  return (data as Promotion | null) ?? null;
}

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
};

const SELECT =
  "id, slug, title, short_desc, description, image, badge, benefits, coupon_code, is_active, sort_order";

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

import { createServiceClient } from "@/lib/supabase/service";

export type HeroImage = { id: string; url: string; alt: string | null; is_active: boolean; sort_order: number };

const FALLBACK: HeroImage[] = [
  { id: "fallback", url: "/images/hero.png", alt: "Hotel Silver Sand Multan building exterior", is_active: true, sort_order: 0 },
];

export async function getHeroImagesStatic(): Promise<HeroImage[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("hero_images")
    .select("id, url, alt, is_active, sort_order")
    .eq("is_active", true)
    .order("sort_order");
  const imgs = (data ?? []) as HeroImage[];
  return imgs.length ? imgs : FALLBACK;
}

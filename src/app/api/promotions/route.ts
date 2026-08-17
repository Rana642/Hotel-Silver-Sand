import { NextResponse } from "next/server";
import { getPromotionsStatic } from "@/lib/promotions";

export const revalidate = 60;

export async function GET() {
  const promos = await getPromotionsStatic();
  return NextResponse.json(
    promos.map((p) => ({ slug: p.slug, title: p.title, short_desc: p.short_desc, badge: p.badge }))
  );
}

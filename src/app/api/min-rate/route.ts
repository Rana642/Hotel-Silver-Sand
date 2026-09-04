import { NextResponse } from "next/server";
import { getRoomsStatic } from "@/lib/rooms";

export const revalidate = 60;

/**
 * Lowest live nightly rate, so the "From PKR x/night" labels follow whatever the
 * owner sets in the admin dashboard instead of a hard-coded number.
 */
export async function GET() {
  const rooms = await getRoomsStatic();
  const prices = rooms.map((r) => Number(r.price_per_night)).filter((n) => n > 0);
  return NextResponse.json({ minRate: prices.length ? Math.min(...prices) : null });
}

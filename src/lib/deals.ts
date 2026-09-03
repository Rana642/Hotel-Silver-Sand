import { createServiceClient } from "@/lib/supabase/service";

export type RateDeal = {
  id: string;
  name: string;
  discount_percent: number;
  start_date: string;
  end_date: string;
  room_id: string | null;
  refundable: boolean;
  free_cancel_days: number;
  is_active: boolean;
  priority: number;
};

export type AppliedDeal = {
  name: string;
  discountPct: number;
  refundable: boolean;
  freeCancelDays: number;
};

/** All active deals (service client — safe for ISR/dynamic public pages). */
export async function getActiveDeals(): Promise<RateDeal[]> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("rate_deals").select("*").eq("is_active", true);
  return (data ?? []) as RateDeal[];
}

/** Best matching deal for a room on a given check-in date (highest priority, then discount). */
export function pickDeal(deals: RateDeal[], roomId: string, checkIn: string): AppliedDeal | null {
  const matches = deals.filter(
    (d) => (d.room_id === null || d.room_id === roomId) && checkIn >= d.start_date && checkIn <= d.end_date
  );
  if (!matches.length) return null;
  matches.sort((a, b) => b.priority - a.priority || Number(b.discount_percent) - Number(a.discount_percent));
  const d = matches[0];
  return {
    name: d.name,
    discountPct: Number(d.discount_percent) || 0,
    refundable: d.refundable,
    freeCancelDays: d.free_cancel_days,
  };
}

/** Server-authoritative single lookup (used by createBooking). */
export async function dealForRoomOnDate(roomId: string, checkIn: string): Promise<AppliedDeal | null> {
  const deals = await getActiveDeals();
  return pickDeal(deals, roomId, checkIn);
}

/** Apply a deal's discount to a base nightly price. */
export function applyDeal(basePrice: number, deal: AppliedDeal | null): number {
  if (!deal || deal.discountPct <= 0) return basePrice;
  return Math.round(basePrice * (1 - deal.discountPct / 100));
}

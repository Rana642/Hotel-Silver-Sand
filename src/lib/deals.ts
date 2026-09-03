import { createServiceClient } from "@/lib/supabase/service";

export type RateDeal = {
  id: string;
  name: string;
  discount_percent: number;
  start_date: string;
  end_date: string;
  room_ids: string[]; // empty = applies to all rooms
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

/**
 * Active date-based deals — sourced from PROMOTIONS (a promotion acts as a deal
 * when it has a discount % and a check-in date window). One place to manage,
 * so there's no separate Deals section to keep in sync.
 */
export async function getActiveDeals(): Promise<RateDeal[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("promotions")
    .select("id, title, discount_percent, start_date, end_date, room_ids, refundable, free_cancel_days, priority")
    .eq("is_active", true)
    .gt("discount_percent", 0)
    .not("start_date", "is", null)
    .not("end_date", "is", null);
  return (data ?? []).map((d) => ({
    id: d.id as string,
    name: d.title as string,
    discount_percent: Number(d.discount_percent) || 0,
    start_date: d.start_date as string,
    end_date: d.end_date as string,
    room_ids: (d.room_ids as string[] | null) ?? [],
    refundable: (d.refundable as boolean) ?? true,
    free_cancel_days: (d.free_cancel_days as number) ?? 2,
    is_active: true,
    priority: (d.priority as number) ?? 0,
  }));
}

/** Best matching deal for a room on a given check-in date (highest priority, then discount). */
export function pickDeal(deals: RateDeal[], roomId: string, checkIn: string): AppliedDeal | null {
  const matches = deals.filter(
    (d) =>
      (d.room_ids.length === 0 || d.room_ids.includes(roomId)) &&
      checkIn >= d.start_date &&
      checkIn <= d.end_date
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

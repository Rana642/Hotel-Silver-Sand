import { createServiceClient } from "@/lib/supabase/service";
import { pktToday, pktNowTime } from "@/lib/availability";

export type LeadTimeType = "none" | "early_bird" | "last_minute";

export type RateDeal = {
  id: string;
  name: string;
  discount_percent: number;
  start_date: string | null;
  end_date: string | null;
  room_ids: string[]; // empty = applies to all rooms
  weekdays: number[]; // 0=Sun..6=Sat; empty = every day (based on check-in weekday)
  lead_time_type: LeadTimeType;
  lead_time_days: number;
  min_nights: number; // Long Stay: 0 = no minimum
  start_time: string | null; // Last Minute only: active-hours window "HH:MM"
  end_time: string | null;
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
    .select("id, title, discount_percent, start_date, end_date, room_ids, weekdays, lead_time_type, lead_time_days, min_nights, start_time, end_time, refundable, free_cancel_days, priority")
    .eq("is_active", true)
    .gt("discount_percent", 0);
  return (data ?? []).map((d) => ({
    id: d.id as string,
    name: d.title as string,
    discount_percent: Number(d.discount_percent) || 0,
    start_date: (d.start_date as string | null) ?? null,
    end_date: (d.end_date as string | null) ?? null,
    room_ids: (d.room_ids as string[] | null) ?? [],
    weekdays: ((d.weekdays as number[] | null) ?? []).map(Number),
    lead_time_type: ((d.lead_time_type as LeadTimeType) ?? "none"),
    lead_time_days: (d.lead_time_days as number) ?? 0,
    min_nights: (d.min_nights as number) ?? 0,
    start_time: (d.start_time as string | null) ?? null,
    end_time: (d.end_time as string | null) ?? null,
    refundable: (d.refundable as boolean) ?? true,
    free_cancel_days: (d.free_cancel_days as number) ?? 2,
    is_active: true,
    priority: (d.priority as number) ?? 0,
  }));
}

/** Whole days between a booking made today and the check-in date. */
function daysBefore(checkIn: string, today: string) {
  return Math.round((Date.parse(checkIn + "T00:00:00Z") - Date.parse(today + "T00:00:00Z")) / 86400000);
}

/** true if now (HH:MM) is inside [start,end]; supports windows crossing midnight. */
function timeInWindow(now: string, start: string, end: string): boolean {
  if (start <= end) return now >= start && now <= end;
  return now >= start || now <= end; // e.g. 22:00 → 02:00
}

/** Does a deal apply for this room / check-in / booking-day (today) / stay length / now-time? */
function dealApplies(d: RateDeal, roomId: string, checkIn: string, today: string, nights: number, nowTime: string): boolean {
  if (d.room_ids.length > 0 && !d.room_ids.includes(roomId)) return false;

  // Long Stay: minimum nights.
  if (d.min_nights > 0 && nights < d.min_nights) return false;

  // Active-hours window (based on the current booking time) — for any deal type.
  if (d.start_time && d.end_time) {
    if (!timeInWindow(nowTime, d.start_time, d.end_time)) return false;
  }

  // Fixed check-in date window (if set).
  if (d.start_date && checkIn < d.start_date) return false;
  if (d.end_date && checkIn > d.end_date) return false;

  // Weekday filter (based on the check-in date's day of week).
  if (d.weekdays.length > 0) {
    const dow = new Date(checkIn + "T00:00:00Z").getUTCDay(); // 0=Sun..6=Sat
    if (!d.weekdays.includes(dow)) return false;
  }

  // Lead-time rule (if set).
  if (d.lead_time_type !== "none") {
    const lead = daysBefore(checkIn, today);
    if (d.lead_time_type === "early_bird" && lead < d.lead_time_days) return false;
    if (d.lead_time_type === "last_minute" && lead > d.lead_time_days) return false;
  }
  return true;
}

/** Best matching deal for a room / check-in / stay (highest priority, then discount). */
export function pickDeal(deals: RateDeal[], roomId: string, checkIn: string, today: string, nights: number, nowTime: string): AppliedDeal | null {
  const matches = deals.filter((d) => dealApplies(d, roomId, checkIn, today, nights, nowTime));
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
export async function dealForRoomOnDate(roomId: string, checkIn: string, nights: number): Promise<AppliedDeal | null> {
  const deals = await getActiveDeals();
  return pickDeal(deals, roomId, checkIn, pktToday(), nights, pktNowTime());
}

/** Apply a deal's discount to a base nightly price. */
export function applyDeal(basePrice: number, deal: AppliedDeal | null): number {
  if (!deal || deal.discountPct <= 0) return basePrice;
  return Math.round(basePrice * (1 - deal.discountPct / 100));
}

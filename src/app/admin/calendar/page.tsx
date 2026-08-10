import { createClient } from "@/lib/supabase/server";
import CalendarView from "@/components/admin/CalendarView";
import type { RoomRow } from "@/types";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const supabase = await createClient();
  const [{ data: rooms }, { data: blocks }] = await Promise.all([
    supabase.from("rooms").select("*").order("sort_order"),
    supabase.from("availability_blocks").select("room_id, date, reason, booking_id"),
  ]);

  const grouped: Record<string, { date: string; reason: string; booking_id: string | null }[]> = {};
  (blocks ?? []).forEach((b) => {
    (grouped[b.room_id] ??= []).push({ date: b.date, reason: b.reason, booking_id: b.booking_id });
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">Availability Calendar</h1>
      <p className="mt-1 text-sm text-slate">Block dates for maintenance or offline bookings.</p>
      <div className="mt-6">
        <CalendarView rooms={(rooms ?? []) as RoomRow[]} blocks={grouped} />
      </div>
    </div>
  );
}

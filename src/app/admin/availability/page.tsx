import AvailabilityCalendar from "@/components/admin/AvailabilityCalendar";
import { getAvailabilityGrid, pktToday, addDays } from "@/lib/availability";

export const dynamic = "force-dynamic";

const DAYS = 14;

export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const today = pktToday();
  const start = /^\d{4}-\d{2}-\d{2}$/.test(sp.start ?? "") ? (sp.start as string) : today;
  const rooms = await getAvailabilityGrid(start, DAYS);
  const end = addDays(start, DAYS - 1); // inclusive last date shown

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">Availability Calendar</h1>
      <p className="mt-1 text-sm text-slate">
        Block dates, track OTA holds, and see how many units of each room type are left per day. When available hits
        zero, the website stops taking bookings for that date automatically.
      </p>
      <div className="mt-6">
        {rooms.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-slate">
            No active rooms yet. Add rooms first, then set each room&apos;s inventory here.
          </p>
        ) : (
          <AvailabilityCalendar rooms={rooms} start={start} end={end} today={today} />
        )}
      </div>
    </div>
  );
}

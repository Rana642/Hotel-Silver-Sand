import { createClient } from "@/lib/supabase/server";
import { pkr } from "@/lib/format";

export const dynamic = "force-dynamic";

type SearchIntentRow = {
  id: string;
  check_in: string | null;
  check_out: string | null;
  nights: number | null;
  adults: number | null;
  children: number | null;
  rooms: number | null;
  room_slug: string | null;
  value: number | null;
  page_url: string | null;
  created_at: string;
};

export default async function SearchIntentsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("search_intents")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (data ?? []) as SearchIntentRow[];
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const todayCount = rows.filter((r) => r.created_at >= dayStart).length;
  const weekCount = rows.filter((r) => r.created_at >= weekStart).length;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">Search Intents</h1>
      <p className="mt-1 text-sm text-slate">
        Every date search on the homepage / Rooms search bar — this is the real guest
        behaviour Meta now optimizes both ad sets against (Search event).
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-card">
          <p className="font-heading text-3xl font-bold text-navy">{todayCount}</p>
          <p className="text-sm text-slate">Today</p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-card">
          <p className="font-heading text-3xl font-bold text-navy">{weekCount}</p>
          <p className="text-sm text-slate">Last 7 Days</p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-card">
          <p className="font-heading text-3xl font-bold text-navy">{rows.length}</p>
          <p className="text-sm text-slate">Last 200 Shown</p>
        </div>
      </div>

      <div className="mt-8">
        {rows.length === 0 ? (
          <p className="rounded-lg border border-gray-100 bg-white p-6 text-center text-slate shadow-card">
            No search intents logged yet — run a date search on the site to test.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-100 bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 text-xs uppercase text-slate">
                <tr>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Check-in → Check-out</th>
                  <th className="px-4 py-3">Nights</th>
                  <th className="px-4 py-3">Guests</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3 text-right">Est. Value</th>
                  <th className="px-4 py-3">Page</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 last:border-0 hover:bg-cream/50">
                    <td className="px-4 py-3 text-slate">{new Date(r.created_at).toLocaleString("en-PK")}</td>
                    <td className="px-4 py-3 text-navy">
                      {r.check_in ?? "—"} → {r.check_out ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate">{r.nights ?? "—"}</td>
                    <td className="px-4 py-3 text-slate">
                      {(r.adults ?? 0) + (r.children ?? 0)} · {r.rooms ?? 1} room{(r.rooms ?? 1) > 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-3 text-slate">{r.room_slug ?? "Homepage"}</td>
                    <td className="px-4 py-3 text-right text-navy">{r.value ? pkr(r.value) : "—"}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-xs text-slate">{r.page_url ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

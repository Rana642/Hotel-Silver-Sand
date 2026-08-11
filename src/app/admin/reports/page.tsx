import { createClient } from "@/lib/supabase/server";
import { pkr } from "@/lib/format";
import ReportExport from "@/components/admin/ReportExport";
import PrintButton from "@/components/admin/PrintButton";
import type { Booking } from "@/types";

export const dynamic = "force-dynamic";

const REVENUE_STATUSES = ["confirmed", "checked_in", "completed"];

function monthDefault() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  return { from, to };
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const def = monthDefault();
  const from = sp.from || def.from;
  const to = sp.to || def.to;

  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .gte("check_in", from)
    .lte("check_in", to)
    .order("check_in", { ascending: false });

  const rows = (data ?? []) as Booking[];
  const revenueRows = rows.filter((b) => REVENUE_STATUSES.includes(b.status));
  const revenue = revenueRows.reduce((s, b) => s + Number(b.total), 0);
  const nightsSold = revenueRows.reduce((s, b) => s + b.nights, 0);
  const avg = revenueRows.length ? revenue / revenueRows.length : 0;

  const byRoom = new Map<string, { count: number; nights: number; revenue: number }>();
  const bySource = new Map<string, { count: number; revenue: number }>();
  const byMonth = new Map<string, number>();
  for (const b of rows) {
    const isRev = REVENUE_STATUSES.includes(b.status);
    const r = byRoom.get(b.room_name) ?? { count: 0, nights: 0, revenue: 0 };
    r.count++; if (isRev) { r.nights += b.nights; r.revenue += Number(b.total); }
    byRoom.set(b.room_name, r);

    const s = bySource.get(b.source) ?? { count: 0, revenue: 0 };
    s.count++; if (isRev) s.revenue += Number(b.total);
    bySource.set(b.source, s);

    if (isRev) {
      const m = b.check_in.slice(0, 7);
      byMonth.set(m, (byMonth.get(m) ?? 0) + Number(b.total));
    }
  }

  const cards = [
    { label: "Bookings", value: String(rows.length) },
    { label: "Confirmed Revenue", value: pkr(revenue) },
    { label: "Nights Sold", value: String(nightsSold) },
    { label: "Avg / Booking", value: pkr(avg) },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy">Reports</h1>
          <p className="mt-1 text-sm text-slate">Revenue, occupancy & source attribution.</p>
        </div>
        <div className="flex items-center gap-2">
          <ReportExport rows={rows} filename={`bookings_${from}_${to}.csv`} />
          <PrintButton />
        </div>
      </div>

      {/* Range filter */}
      <form className="mt-4 flex flex-wrap items-end gap-3 print:hidden" method="get">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-navy">From</span>
          <input type="date" name="from" defaultValue={from} className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-navy">To</span>
          <input type="date" name="to" defaultValue={to} className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </label>
        <button className="rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-dark">Apply</button>
      </form>

      <p className="mt-4 text-sm text-slate">Range: <span className="font-semibold text-navy">{from} → {to}</span></p>

      {/* Summary cards */}
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-gray-100 bg-white p-5 shadow-card">
            <p className="font-heading text-2xl font-bold text-navy">{c.value}</p>
            <p className="text-sm text-slate">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <ReportTable title="Revenue by Month" head={["Month", "Revenue"]} rows={[...byMonth.entries()].sort().map(([m, v]) => [m, pkr(v)])} />
        <ReportTable title="By Source" head={["Source", "Bookings", "Revenue"]} rows={[...bySource.entries()].map(([s, v]) => [s, String(v.count), pkr(v.revenue)])} />
        <ReportTable title="By Room" head={["Room", "Nights", "Revenue"]} rows={[...byRoom.entries()].map(([r, v]) => [r, String(v.nights), pkr(v.revenue)])} />
      </div>
    </div>
  );
}

function ReportTable({ title, head, rows }: { title: string; head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-card">
      <p className="border-b border-gray-100 px-4 py-3 font-heading font-bold text-navy">{title}</p>
      {rows.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-slate">No data.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase text-slate">
            <tr>{head.map((h, i) => <th key={h} className={`px-4 py-2 ${i > 0 ? "text-right" : ""}`}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri} className="border-b border-gray-50 last:border-0">
                {r.map((c, ci) => <td key={ci} className={`px-4 py-2 ${ci > 0 ? "text-right text-navy" : "text-slate"}`}>{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

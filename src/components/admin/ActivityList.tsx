"use client";

import { useMemo, useState } from "react";
import { fmtDateTime } from "@/lib/format";

export type ActivityRow = {
  id: string;
  user_email: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  detail: string | null;
  created_at: string;
};

export default function ActivityList({ rows }: { rows: ActivityRow[] }) {
  const [action, setAction] = useState("all");
  const [q, setQ] = useState("");

  const actions = useMemo(() => Array.from(new Set(rows.map((r) => r.action))).sort(), [rows]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (action !== "all" && r.action !== action) return false;
      if (!query) return true;
      return (
        (r.user_email ?? "").toLowerCase().includes(query) ||
        (r.detail ?? "").toLowerCase().includes(query) ||
        (r.entity_id ?? "").toLowerCase().includes(query)
      );
    });
  }, [rows, action, q]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
        >
          <option value="all">All actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search user, detail, id…"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40 sm:w-72"
        />
        <span className="text-sm text-slate">{filtered.length} entries</span>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 rounded-lg border border-gray-100 bg-white p-6 text-center text-slate shadow-card">
          No activity.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-gray-100 bg-white shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 text-xs uppercase text-slate">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Detail</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-slate">{fmtDateTime(r.created_at)}</td>
                  <td className="px-4 py-3 text-navy">{r.user_email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-navy/5 px-2 py-0.5 font-mono text-xs text-navy">{r.action}</span>
                  </td>
                  <td className="px-4 py-3 text-slate">{r.detail ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

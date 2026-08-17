"use client";

import { useMemo, useState } from "react";
import { Search, Phone, Mail, MessageCircle, Download } from "lucide-react";
import type { Contact } from "@/lib/contacts";
import { pkr } from "@/lib/format";

function waHref(phone: string | null) {
  const d = (phone ?? "").replace(/\D/g, "");
  if (d.length < 7) return null;
  // Pakistan local numbers (03xx…) → 92xx…
  const intl = d.startsWith("0") ? "92" + d.slice(1) : d;
  return `https://wa.me/${intl}`;
}

export default function ContactsTable({ contacts }: { contacts: Contact[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return contacts;
    return contacts.filter(
      (c) =>
        c.name?.toLowerCase().includes(s) ||
        (c.phone ?? "").toLowerCase().includes(s) ||
        (c.email ?? "").toLowerCase().includes(s)
    );
  }, [q, contacts]);

  function exportCsv() {
    const head = ["Name", "Phone", "Email", "Bookings", "Last stay", "Total (PKR)"];
    const rows = filtered.map((c) => [
      c.name ?? "",
      c.phone ?? "",
      c.email ?? "",
      String(c.bookings),
      c.lastStay ?? "",
      String(c.totalSpent),
    ]);
    const csv = [head, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `contacts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, phone or email…"
            className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate">{filtered.length} contact{filtered.length === 1 ? "" : "s"}</span>
          <button
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 rounded-md border border-navy/20 px-3 py-2 text-sm font-semibold text-navy hover:bg-navy hover:text-white disabled:opacity-40"
          >
            <Download className="size-4" /> Export CSV
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-slate">
          {contacts.length === 0 ? "No contacts yet — they appear here automatically as bookings come in." : "No contacts match your search."}
        </p>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="mt-4 space-y-3 lg:hidden">
            {filtered.map((c) => {
              const wa = waHref(c.phone);
              return (
                <div key={c.key} className="rounded-lg border border-gray-100 bg-white p-4 shadow-card">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-navy">{c.name || "—"}</span>
                    <span className="rounded-full bg-cream px-2 py-0.5 text-xs font-semibold text-navy">
                      {c.bookings} booking{c.bookings === 1 ? "" : "s"}
                    </span>
                  </div>
                  {c.phone && <p className="mt-1 text-sm text-slate">{c.phone}</p>}
                  {c.email && <p className="text-sm text-slate">{c.email}</p>}
                  <p className="mt-1 text-xs text-slate">
                    Last stay: {c.lastStay ?? "—"} · Total {pkr(c.totalSpent)}
                  </p>
                  <div className="mt-3 flex gap-2">
                    {c.phone && (
                      <a href={`tel:${c.phone}`} className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-navy/20 py-2 text-sm font-semibold text-navy">
                        <Phone className="size-4" /> Call
                      </a>
                    )}
                    {wa && (
                      <a href={wa} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-[#25D366] py-2 text-sm font-semibold text-white">
                        <MessageCircle className="size-4" /> WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="mt-4 hidden overflow-x-auto rounded-lg border border-gray-100 bg-white shadow-card lg:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 text-xs uppercase text-slate">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3 text-center">Bookings</th>
                  <th className="px-4 py-3">Last stay</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Reach</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const wa = waHref(c.phone);
                  return (
                    <tr key={c.key} className="border-b border-gray-50 last:border-0 hover:bg-cream/50">
                      <td className="px-4 py-3 font-semibold text-navy">{c.name || "—"}</td>
                      <td className="px-4 py-3 text-slate">
                        {c.phone ? <a href={`tel:${c.phone}`} className="hover:text-gold">{c.phone}</a> : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate">
                        {c.email ? <a href={`mailto:${c.email}`} className="hover:text-gold">{c.email}</a> : "—"}
                      </td>
                      <td className="px-4 py-3 text-center text-navy">{c.bookings}</td>
                      <td className="px-4 py-3 text-slate">{c.lastStay ?? "—"}</td>
                      <td className="px-4 py-3 text-right text-navy">{pkr(c.totalSpent)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {c.phone && (
                            <a href={`tel:${c.phone}`} aria-label="Call" className="rounded p-1.5 text-navy hover:bg-cream"><Phone className="size-4" /></a>
                          )}
                          {c.email && (
                            <a href={`mailto:${c.email}`} aria-label="Email" className="rounded p-1.5 text-navy hover:bg-cream"><Mail className="size-4" /></a>
                          )}
                          {wa && (
                            <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="rounded p-1.5 text-[#128C4A] hover:bg-cream"><MessageCircle className="size-4" /></a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

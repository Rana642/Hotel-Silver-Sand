"use client";

import { Download } from "lucide-react";
import type { Booking } from "@/types";

function toCsv(rows: Booking[]) {
  const headers = [
    "booking_ref", "status", "source", "room_name", "guest_name", "guest_phone",
    "check_in", "check_out", "nights", "unit_price", "total", "created_at",
  ];
  const esc = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(",")];
  for (const b of rows) {
    lines.push(headers.map((h) => esc((b as unknown as Record<string, unknown>)[h])).join(","));
  }
  return lines.join("\n");
}

export default function ReportExport({ rows, filename }: { rows: Booking[]; filename: string }) {
  function download() {
    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={download}
      className="inline-flex items-center gap-1.5 rounded-md border border-navy/20 px-3 py-1.5 text-sm font-semibold text-navy hover:bg-navy hover:text-white"
    >
      <Download className="size-4" /> Export CSV
    </button>
  );
}

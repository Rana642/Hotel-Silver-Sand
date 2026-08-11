"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-navy-dark hover:brightness-95"
    >
      <Printer className="size-4" /> Print
    </button>
  );
}

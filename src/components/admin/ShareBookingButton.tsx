"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";

export default function ShareBookingButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(text)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md bg-[#25D366] px-3 py-1.5 text-sm font-semibold text-white hover:brightness-95"
      >
        <Share2 className="size-4" /> Share on WhatsApp
      </a>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {}
        }}
        title="Copy details"
        aria-label="Copy booking details"
        className="inline-flex items-center gap-1.5 rounded-md border border-navy/20 px-2.5 py-1.5 text-sm font-semibold text-navy hover:bg-navy hover:text-white"
      >
        {copied ? <Check className="size-4 text-green-600" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
}

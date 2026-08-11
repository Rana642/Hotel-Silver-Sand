"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Phone, MessageCircle, ArrowRightCircle, Trash2 } from "lucide-react";
import { setInquiryStatus, deleteInquiry } from "@/app/actions/inquiry";
import { fmtDateTime } from "@/lib/format";

export type Inquiry = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  room_interest: string | null;
  check_in: string | null;
  check_out: string | null;
  message: string | null;
  source: string | null;
  status: string;
  created_at: string;
};

const statusOpts = ["new", "contacted", "converted", "closed"];
const statusCls: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  converted: "bg-green-100 text-green-700",
  closed: "bg-gray-200 text-gray-600",
};

function wa(phone: string) {
  return "https://wa.me/" + phone.replace(/[^\d]/g, "").replace(/^0/, "92");
}

export default function InquiriesTable({ inquiries, isAdmin }: { inquiries: Inquiry[]; isAdmin: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function convert(q: Inquiry) {
    const params = new URLSearchParams();
    params.set("name", q.name);
    params.set("phone", q.phone);
    if (q.email) params.set("email", q.email);
    if (q.check_in) params.set("checkIn", q.check_in);
    if (q.check_out) params.set("checkOut", q.check_out);
    if (q.room_interest) params.set("room", q.room_interest);
    start(async () => {
      await setInquiryStatus(q.id, "converted");
      router.push(`/admin/bookings/new?${params.toString()}`);
    });
  }

  if (inquiries.length === 0) {
    return (
      <p className="rounded-lg border border-gray-100 bg-white p-6 text-center text-slate shadow-card">
        No inquiries yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {inquiries.map((q) => (
        <div key={q.id} className="rounded-lg border border-gray-100 bg-white p-4 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-navy">{q.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusCls[q.status] ?? statusCls.new}`}>
                  {q.status}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-slate">{q.phone}{q.email ? ` · ${q.email}` : ""}</p>
              {(q.room_interest || q.check_in) && (
                <p className="text-xs text-slate">
                  {q.room_interest ?? ""} {q.check_in ? `· ${q.check_in}${q.check_out ? ` → ${q.check_out}` : ""}` : ""}
                </p>
              )}
              {q.message && <p className="mt-2 max-w-xl whitespace-pre-wrap text-sm text-navy/80">{q.message}</p>}
              <p className="mt-1 text-xs text-gray-400">{fmtDateTime(q.created_at)}</p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <a href={`tel:${q.phone}`} className="rounded-md border border-navy/20 p-2 text-navy hover:bg-navy hover:text-white" aria-label="Call">
                <Phone className="size-4" />
              </a>
              <a href={wa(q.phone)} target="_blank" rel="noopener noreferrer" className="rounded-md bg-[#25D366] p-2 text-white hover:brightness-95" aria-label="WhatsApp">
                <MessageCircle className="size-4" />
              </a>
              <button
                disabled={pending}
                onClick={() => convert(q)}
                className="flex items-center gap-1 rounded-md bg-gold px-2.5 py-2 text-xs font-semibold text-navy-dark hover:brightness-95 disabled:opacity-50"
              >
                <ArrowRightCircle className="size-4" /> Convert
              </button>
              {isAdmin && (
                <button
                  disabled={pending}
                  onClick={() => {
                    if (!window.confirm("Delete this inquiry?")) return;
                    setError(null);
                    start(async () => {
                      const r = await deleteInquiry(q.id);
                      if (!r.ok) setError(r.error);
                      else router.refresh();
                    });
                  }}
                  className="rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50"
                  aria-label="Delete"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {statusOpts.map((s) => (
              <button
                key={s}
                disabled={pending || q.status === s}
                onClick={() => start(async () => {
                  await setInquiryStatus(q.id, s);
                  router.refresh();
                })}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition disabled:opacity-40 ${
                  q.status === s ? statusCls[s] : "bg-gray-100 text-slate hover:bg-gray-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

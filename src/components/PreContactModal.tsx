"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X, MessageSquare, Phone, MapPin } from "lucide-react";
import { site, tel, waLink } from "@/data/site";
import { createInquiry } from "@/app/actions/inquiry";

export type ContactMode = "whatsapp" | "call";

export default function PreContactModal({
  mode,
  onClose,
}: {
  mode: ContactMode;
  onClose: () => void;
}) {
  const [intent, setIntent] = useState<"book" | "inquiry">("book");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [busy, setBusy] = useState(false);
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    dialogRef.current?.querySelector<HTMLElement>("input")?.focus();
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const isCall = mode === "call";

  function proceed() {
    if (isCall) {
      window.location.href = tel;
    } else {
      const msg = [
        `*${intent === "book" ? "Booking request" : "Inquiry"} — ${site.name}*`,
        name ? `Name: ${name}` : "",
        phone ? `Phone: ${phone}` : "",
        email ? `Email: ${email}` : "",
        checkIn ? `Check-in: ${checkIn}` : "",
        checkOut ? `Check-out: ${checkOut}` : "",
      ]
        .filter(Boolean)
        .join("\n");
      window.open(waLink(msg), "_blank", "noopener");
    }
    onClose();
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const err: { name?: string; phone?: string } = {};
    if (!name.trim()) err.name = "Please enter your name";
    if (!/^[+()\d\s-]{7,}$/.test(phone)) err.phone = "Enter a valid phone number";
    setErrors(err);
    if (Object.keys(err).length) return;

    setBusy(true);
    // Save the lead (fire-and-forget) then continue to WhatsApp/Call.
    void createInquiry({
      name,
      phone,
      email,
      roomInterest: intent === "book" ? "Wants to book a room" : "General inquiry",
      checkIn: intent === "book" ? checkIn || undefined : undefined,
      checkOut: intent === "book" ? checkOut || undefined : undefined,
      message: intent === "book" ? "Booking request via quick form" : "Inquiry via quick form",
      source: isCall ? "call_button" : "whatsapp_button",
    });
    proceed();
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto bg-black/60 p-4 py-8 sm:items-center"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-2xl bg-white shadow-pop"
      >
        <div className="flex items-start justify-between px-6 pt-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-[#25D366]/15 text-[#128C4A]">
              <MessageSquare className="size-5" />
            </span>
            <div>
              <h2 id={titleId} className="font-heading text-lg font-bold text-navy">
                Quick details 👋
              </h2>
              <p className="text-sm text-slate">So we can serve you faster</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-navy">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 pb-6 pt-4" noValidate>
          <div className="mb-4 flex items-center gap-2 rounded-md border border-gold/40 bg-gold/10 px-3 py-2 text-sm font-semibold text-navy">
            <MapPin className="size-4 shrink-0 text-gold" />
            <span>Hotel Silver Sand, <span className="text-gold">Multan, Pakistan</span></span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate">You want to</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(["book", "inquiry"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setIntent(v)}
                className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                  intent === v ? "border-navy bg-navy text-white" : "border-gray-200 text-navy hover:border-navy/40"
                }`}
              >
                {v === "book" ? "Book a room" : "Inquiry"}
              </button>
            ))}
          </div>

          <label className="mt-4 block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate">
              Your Name <span className="text-red-500">*</span>
            </span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ali Ahmed" className={inputCls(errors.name)} />
            {errors.name && <span className="mt-1 block text-xs text-red-500">{errors.name}</span>}
          </label>

          <label className="mt-4 block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate">
              Phone <span className="text-red-500">*</span>
            </span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0317-XXX-XXXX" inputMode="tel" className={inputCls(errors.phone)} />
            {errors.phone ? (
              <span className="mt-1 block text-xs text-red-500">{errors.phone}</span>
            ) : (
              <span className="mt-1 block text-xs text-slate">So we can follow up if the WhatsApp chat drops.</span>
            )}
          </label>

          <label className="mt-4 block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate">
              Email <span className="font-normal normal-case text-gray-400">(optional)</span>
            </span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls()} />
          </label>

          {intent === "book" && (
            <div className="mt-4 rounded-lg bg-cream/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">
                Dates <span className="font-normal normal-case">— optional, ok to skip</span>
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={inputCls()} />
                <input type="date" min={checkIn} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={inputCls()} />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className={`mt-5 flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition disabled:opacity-70 ${
              isCall ? "bg-navy hover:bg-navy-dark" : "bg-[#25D366] hover:brightness-95"
            }`}
          >
            {isCall ? <Phone className="size-4" /> : <MessageSquare className="size-4" />}
            {isCall ? "Call Now" : "Open WhatsApp"}
          </button>

          <button
            type="button"
            onClick={proceed}
            className="mt-3 block w-full text-center text-sm text-slate underline hover:text-navy"
          >
            {isCall ? "Skip, call directly" : "Skip, open WhatsApp directly"}
          </button>
        </form>
      </div>
    </div>
  );
}

function inputCls(error?: string) {
  return `w-full rounded-lg border bg-white px-3 py-2.5 text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/40 ${
    error ? "border-red-400" : "border-gray-300 focus:border-gold"
  }`;
}

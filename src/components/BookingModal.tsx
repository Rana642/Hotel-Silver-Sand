"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X, CalendarDays, Users, Home, User, Phone, Mail, MessageSquare, CheckCircle2 } from "lucide-react";
import { site, waLink } from "@/data/site";
import { roomTypeOptions } from "@/data/rooms";

type Props = {
  onClose: () => void;
  presetRoom?: string;
};

type Errors = Partial<Record<string, string>>;

const empty = {
  checkIn: "",
  checkOut: "",
  guests: "",
  roomsCount: "",
  roomType: "",
  name: "",
  phone: "",
  email: "",
  requests: "",
};

export default function BookingModal({ onClose, presetRoom }: Props) {
  const [form, setForm] = useState(() => ({ ...empty, roomType: presetRoom ?? "" }));
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    dialogRef.current?.querySelector<HTMLElement>("input,select,button")?.focus();
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const set = (k: keyof typeof empty, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function validate(): Errors {
    const e: Errors = {};
    if (!form.checkIn) e.checkIn = "Check-in date is required";
    if (!form.checkOut) e.checkOut = "Check-out date is required";
    if (form.checkIn && form.checkOut && form.checkOut <= form.checkIn)
      e.checkOut = "Check-out must be after check-in";
    if (!form.guests || Number(form.guests) < 1) e.guests = "Enter a valid number of guests";
    if (!form.roomsCount || Number(form.roomsCount) < 1) e.roomsCount = "Enter a valid number of rooms";
    if (!form.roomType) e.roomType = "Please select a room type";
    if (!form.name.trim()) e.name = "Full name is required";
    if (!/^[+()\d\s-]{7,}$/.test(form.phone)) e.phone = "Enter a valid phone number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    return e;
  }

  function buildMessage() {
    return [
      `*New Booking Request — ${site.name}*`,
      "",
      `Room: ${form.roomType}`,
      `Check-in: ${form.checkIn}`,
      `Check-out: ${form.checkOut}`,
      `Guests: ${form.guests}`,
      `Rooms: ${form.roomsCount}`,
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      `Email: ${form.email}`,
      form.requests ? `Special requests: ${form.requests}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  function handleWhatsApp() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    window.open(waLink(buildMessage()), "_blank", "noopener");
    setSubmitted(true);
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    window.open(waLink(buildMessage()), "_blank", "noopener");
    setSubmitted(true);
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-4 py-8 sm:items-center"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-2xl rounded-xl bg-white shadow-pop"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 id={titleId} className="font-heading text-xl font-bold text-navy">
            {submitted ? "Request Sent" : presetRoom ? `Book ${presetRoom}` : "Book Your Stay"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking form"
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-navy"
          >
            <X className="size-5" />
          </button>
        </div>

        {submitted ? (
          <div className="px-6 py-10 text-center">
            <CheckCircle2 className="mx-auto size-14 text-green-500" />
            <p className="mt-4 font-heading text-lg font-semibold text-navy">
              Your booking request has been prepared.
            </p>
            <p className="mt-2 text-slate">
              We&apos;ve opened WhatsApp with your details. Our team will confirm your
              reservation shortly. You can also call us at{" "}
              <a href={`tel:${site.phoneIntl}`} className="font-semibold text-navy underline">
                {site.phone}
              </a>
              .
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-md bg-navy px-6 py-2.5 font-semibold text-white hover:bg-navy-dark"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Check-In Date" icon={CalendarDays} error={errors.checkIn}>
                <input
                  type="date"
                  min={today}
                  value={form.checkIn}
                  onChange={(e) => set("checkIn", e.target.value)}
                  className={inputCls(errors.checkIn)}
                />
              </Field>
              <Field label="Check-Out Date" icon={CalendarDays} error={errors.checkOut}>
                <input
                  type="date"
                  min={form.checkIn || today}
                  value={form.checkOut}
                  onChange={(e) => set("checkOut", e.target.value)}
                  className={inputCls(errors.checkOut)}
                />
              </Field>
              <Field label="Number of Guests" icon={Users} error={errors.guests}>
                <input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  placeholder="Enter number of guests"
                  value={form.guests}
                  onChange={(e) => set("guests", e.target.value)}
                  className={inputCls(errors.guests)}
                />
              </Field>
              <Field label="Number of Rooms" icon={Home} error={errors.roomsCount}>
                <input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  placeholder="Enter number of rooms"
                  value={form.roomsCount}
                  onChange={(e) => set("roomsCount", e.target.value)}
                  className={inputCls(errors.roomsCount)}
                />
              </Field>
            </div>

            <Field label="Room Type" icon={Home} error={errors.roomType} className="mt-4">
              <select
                value={form.roomType}
                onChange={(e) => set("roomType", e.target.value)}
                className={inputCls(errors.roomType)}
              >
                <option value="">Select room type</option>
                {roomTypeOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Full Name" icon={User} error={errors.name} className="mt-4">
              <input
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className={inputCls(errors.name)}
              />
            </Field>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Phone Number" icon={Phone} error={errors.phone}>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className={inputCls(errors.phone)}
                />
              </Field>
              <Field label="Email" icon={Mail} error={errors.email}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className={inputCls(errors.email)}
                />
              </Field>
            </div>

            <Field label="Special Requests (Optional)" icon={MessageSquare} className="mt-4">
              <textarea
                rows={3}
                placeholder="Any special requests or requirements?"
                value={form.requests}
                onChange={(e) => set("requests", e.target.value)}
                className={inputCls() + " resize-y"}
              />
            </Field>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="submit"
                className="rounded-md bg-gold px-6 py-3 font-semibold text-navy-dark transition hover:bg-gold-dark"
              >
                Book Now
              </button>
              <button
                type="button"
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-6 py-3 font-semibold text-white transition hover:brightness-95"
              >
                <MessageSquare className="size-4" /> WhatsApp Booking
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function inputCls(error?: string) {
  return `w-full rounded-md border bg-white px-3 py-2.5 text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/40 ${
    error ? "border-red-400" : "border-gray-300 focus:border-gold"
  }`;
}

function Field({
  label,
  icon: Icon,
  error,
  children,
  className = "",
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-navy">
        <Icon className="size-4 text-gold" /> {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}

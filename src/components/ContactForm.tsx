"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { waLink } from "@/data/site";

const empty = { name: "", email: "", phone: "", message: "" };

export default function ContactForm() {
  const [form, setForm] = useState({ ...empty });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const set = (k: keyof typeof empty, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!/^[+()\d\s-]{7,}$/.test(form.phone)) e.phone = "Enter a valid phone number";
    if (!form.message.trim()) e.message = "Please enter a message";
    return e;
  }

  function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    const msg = [
      `*Contact enquiry — Hotel Silver Sand Multan*`,
      "",
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone}`,
      `Message: ${form.message}`,
    ].join("\n");
    window.open(waLink(msg), "_blank", "noopener");
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-8 text-center shadow-card">
        <CheckCircle2 className="mx-auto size-12 text-green-500" />
        <p className="mt-4 font-heading text-lg font-semibold text-navy">Message ready to send</p>
        <p className="mt-2 text-slate">
          We&apos;ve opened WhatsApp with your message. Our team will reply as soon as possible.
        </p>
        <button
          type="button"
          onClick={() => {
            setForm({ ...empty });
            setSent(false);
          }}
          className="mt-6 rounded-md bg-navy px-6 py-2.5 font-semibold text-white hover:bg-navy-dark"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-xl border border-gray-100 bg-white p-6 shadow-card sm:p-8"
    >
      <h2 className="font-heading text-2xl font-bold text-navy">Send Us a Message</h2>
      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-navy">Full Name</span>
          <input
            type="text"
            placeholder="Enter your full name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputCls(errors.name)}
          />
          {errors.name && <span className="mt-1 block text-xs text-red-500">{errors.name}</span>}
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy">Email Address</span>
            <input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputCls(errors.email)}
            />
            {errors.email && (
              <span className="mt-1 block text-xs text-red-500">{errors.email}</span>
            )}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy">Phone Number</span>
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className={inputCls(errors.phone)}
            />
            {errors.phone && (
              <span className="mt-1 block text-xs text-red-500">{errors.phone}</span>
            )}
          </label>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-navy">Message</span>
          <textarea
            rows={5}
            placeholder="How can we help you?"
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            className={inputCls(errors.message) + " resize-y"}
          />
          {errors.message && (
            <span className="mt-1 block text-xs text-red-500">{errors.message}</span>
          )}
        </label>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 font-semibold text-navy-dark transition hover:brightness-95"
        >
          <Send className="size-4" /> Send Message
        </button>
      </div>
    </form>
  );
}

function inputCls(error?: string) {
  return `w-full rounded-md border bg-white px-3 py-2.5 text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/40 ${
    error ? "border-red-400" : "border-gray-300 focus:border-gold"
  }`;
}

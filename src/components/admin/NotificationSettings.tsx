"use client";

import { useState, useTransition } from "react";
import { Save, Trash2, Send, CheckCircle2, XCircle, Mail } from "lucide-react";
import { setNotifyEmail, clearNotifyEmail, sendTestEmail } from "@/app/actions/settings";

export default function NotificationSettings({
  current,
  keyConfigured,
  keyHint,
  from,
}: {
  current: string | null;
  keyConfigured: boolean;
  keyHint: string;
  from: string | null;
}) {
  const [email, setEmail] = useState(current ?? "");
  const [recipient, setRecipient] = useState(current);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const field = "w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40";

  function save() {
    setMsg(null);
    start(async () => {
      const res = await setNotifyEmail(email);
      if (res.ok) { setRecipient(email.trim().toLowerCase()); setMsg({ ok: true, text: "Saved. New bookings & inquiries go here." }); }
      else setMsg({ ok: false, text: res.error });
    });
  }
  function remove() {
    setMsg(null);
    start(async () => {
      const res = await clearNotifyEmail();
      if (res.ok) { setRecipient(null); setEmail(""); setMsg({ ok: true, text: "Removed. Falling back to the environment default." }); }
      else setMsg({ ok: false, text: res.error });
    });
  }
  function test() {
    setMsg(null);
    start(async () => {
      const res = await sendTestEmail();
      setMsg(res.ok ? { ok: true, text: `Test email sent to ${recipient}. Check the inbox (and spam) within 30s.` } : { ok: false, text: res.error });
    });
  }

  return (
    <div className="space-y-6">
      {/* Current config */}
      <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-card">
        <p className="text-xs font-bold uppercase tracking-wider text-slate">Current Configuration</p>
        <div className="mt-3 space-y-3 text-sm">
          <div className="flex items-start gap-2">
            {keyConfigured ? <CheckCircle2 className="mt-0.5 size-4 text-green-500" /> : <XCircle className="mt-0.5 size-4 text-red-500" />}
            <div>
              <p className="font-semibold text-navy">Resend API key</p>
              <p className="text-slate">{keyConfigured ? <>Configured — key ending in <code className="bg-cream px-1">{keyHint}</code></> : "Not set (add RESEND_API_KEY)"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            {from ? <CheckCircle2 className="mt-0.5 size-4 text-green-500" /> : <XCircle className="mt-0.5 size-4 text-red-500" />}
            <div>
              <p className="font-semibold text-navy">Sending address</p>
              <p className="text-slate">{from ? <code className="bg-cream px-1">{from}</code> : "Not set (add RESEND_FROM with a verified domain)"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            {recipient ? <CheckCircle2 className="mt-0.5 size-4 text-green-500" /> : <XCircle className="mt-0.5 size-4 text-amber-500" />}
            <div>
              <p className="font-semibold text-navy">Notification recipient</p>
              <p className="text-slate">{recipient ?? "Not set"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Change recipient */}
      <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-card">
        <p className="text-xs font-bold uppercase tracking-wider text-slate">Change Notification Recipient</p>
        <p className="mt-1 text-sm text-slate">The email that receives every new booking &amp; inquiry. Change takes effect immediately.</p>
        <label className="mt-4 block">
          <span className="mb-1 block text-xs font-semibold text-navy">Email address</span>
          <div className="flex flex-wrap gap-2">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={field + " flex-1"} />
            <button onClick={save} disabled={pending} className="flex items-center gap-1.5 rounded-md bg-gold px-4 py-2.5 text-sm font-semibold text-navy-dark hover:brightness-95 disabled:opacity-60">
              <Save className="size-4" /> Save
            </button>
            {recipient && (
              <button onClick={remove} disabled={pending} className="flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-60">
                <Trash2 className="size-4" /> Remove
              </button>
            )}
          </div>
        </label>
      </div>

      {/* Test */}
      <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-card">
        <p className="text-xs font-bold uppercase tracking-wider text-slate">Send Test Email</p>
        <p className="mt-1 text-sm text-slate">Fire a real email to <b>{recipient ?? "the configured recipient"}</b> to confirm delivery.</p>
        <button onClick={test} disabled={pending || !recipient} className="mt-4 flex items-center gap-2 rounded-md bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-dark disabled:opacity-60">
          <Send className="size-4" /> {pending ? "Sending…" : "Send Test Email"}
        </button>
      </div>

      {msg && (
        <p className={`flex items-center gap-2 rounded-md px-4 py-3 text-sm ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
          <Mail className="size-4" /> {msg.text}
        </p>
      )}

      <div className="text-xs leading-relaxed text-slate">
        <p className="font-semibold text-navy">If a test email doesn&apos;t arrive:</p>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          <li>Check the recipient&apos;s spam / promotions folder.</li>
          <li>Confirm the sending domain is verified in your Resend dashboard.</li>
          <li>If Resend says &quot;you can only send to your own email&quot;, verify your domain (or use that address).</li>
        </ul>
      </div>
    </div>
  );
}

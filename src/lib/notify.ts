import { sendEmail, emailConfigured } from "@/lib/email";
import { getNotifyEmail } from "@/lib/settings";
import { site } from "@/data/site";
import { fmtDate, pkr } from "@/lib/format";

const wrap = (title: string, rows: [string, string][], footer = "") => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#0b2b4b">
    <div style="background:#0b2b4b;color:#fff;padding:16px 20px">
      <div style="font-size:13px;letter-spacing:1px;color:#d9a928;text-transform:uppercase">${site.name}</div>
      <div style="font-size:18px;font-weight:bold;margin-top:2px">${title}</div>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:9px 20px;color:#4a4a4a;width:150px;border-bottom:1px solid #eee">${k}</td><td style="padding:9px 20px;border-bottom:1px solid #eee">${v}</td></tr>`
        )
        .join("")}
    </table>
    ${footer ? `<div style="padding:14px 20px;font-size:13px;color:#4a4a4a">${footer}</div>` : ""}
  </div>`;

type BookingLike = {
  booking_ref: string;
  guest_name: string;
  guest_phone: string;
  guest_email?: string | null;
  room_name: string;
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  rooms_count: number;
  total: number;
  special_request?: string | null;
};

/** Notify the hotel of a new booking + send the guest a confirmation. */
export async function notifyBooking(b: BookingLike) {
  if (!emailConfigured()) return;
  const to = await getNotifyEmail();
  const rows: [string, string][] = [
    ["Booking Ref", `<b>${b.booking_ref}</b>`],
    ["Guest", b.guest_name],
    ["Phone", b.guest_phone],
    ...(b.guest_email ? ([["Email", b.guest_email]] as [string, string][]) : []),
    ["Room", b.room_name],
    ["Check-in", fmtDate(b.check_in)],
    ["Check-out", fmtDate(b.check_out)],
    ["Nights / Guests / Rooms", `${b.nights} / ${b.guests} / ${b.rooms_count}`],
    ...(b.special_request ? ([["Request", b.special_request]] as [string, string][]) : []),
    ["Total", `<b style="color:#d9a928">${pkr(b.total)}</b>`],
  ];

  if (to) {
    await sendEmail({
      to,
      subject: `New booking ${b.booking_ref} — ${b.guest_name}`,
      html: wrap("New Booking Request", rows, "Contact the guest to confirm. Payment is collected at the hotel."),
      replyTo: b.guest_email || undefined,
    });
  }

  if (b.guest_email) {
    await sendEmail({
      to: b.guest_email,
      subject: `Your booking request ${b.booking_ref} — ${site.name}`,
      html: wrap(
        "Thank you for your booking request",
        rows.filter(([k]) => k !== "Phone" && k !== "Email"),
        `We've received your request and our team will confirm shortly on WhatsApp or by phone. No payment is required now — you pay at the hotel. Call us at ${site.phone}.`
      ),
    });
  }
}

type InquiryLike = {
  name: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  source?: string | null;
};

/** Notify the hotel of a new inquiry / lead. */
export async function notifyInquiry(q: InquiryLike) {
  if (!emailConfigured()) return;
  const to = await getNotifyEmail();
  if (!to) return;
  const rows: [string, string][] = [
    ["Name", q.name],
    ["Phone", q.phone],
    ...(q.email ? ([["Email", q.email]] as [string, string][]) : []),
    ...(q.source ? ([["Source", q.source]] as [string, string][]) : []),
    ...(q.message ? ([["Message", q.message]] as [string, string][]) : []),
  ];
  await sendEmail({
    to,
    subject: `New inquiry — ${q.name}`,
    html: wrap("New Inquiry / Lead", rows, "Follow up with the guest as soon as possible."),
    replyTo: q.email || undefined,
  });
}

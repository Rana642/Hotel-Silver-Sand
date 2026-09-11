"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/app/actions/activity";
import { notifyInquiry } from "@/lib/notify";
import { sendMetaEvent } from "@/lib/meta-capi";
import { rooms as fallbackRooms } from "@/data/rooms";
import crypto from "node:crypto";

export type InquiryInput = {
  name: string;
  phone: string;
  email?: string;
  roomInterest?: string;
  checkIn?: string;
  checkOut?: string;
  message?: string;
  source?: string;
  /** Shared with the browser Pixel's fbq call so Meta dedupes the two signals. */
  metaEventId?: string;
  /** Real dates + booking intent, not just a curious click — see PreContactModal. */
  metaQualified?: boolean;
  metaValue?: number;
  pageUrl?: string;
};

export type InquiryResult = { success: true } | { success: false; error: string };

/** Public — called from the website contact form. Uses the service client. */
export async function createInquiry(input: InquiryInput): Promise<InquiryResult> {
  if (!input.name?.trim() || !input.phone?.trim()) {
    return { success: false, error: "Name and phone are required." };
  }
  const supabase = createServiceClient();
  const { error } = await supabase.from("inquiries").insert({
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || null,
    room_interest: input.roomInterest?.trim() || null,
    check_in: input.checkIn || null,
    check_out: input.checkOut || null,
    message: input.message?.trim() || null,
    source: input.source?.trim() || "contact_form",
    status: "new",
  });
  if (error) return { success: false, error: "Could not send your message. Please try WhatsApp or call us." };

  // Meta Conversions API — direct server call (no GTM), carrying the real
  // name/phone/email captured on this form for the best match quality.
  // Deduped against the browser Pixel fire via metaEventId when present.
  // "Schedule" (qualified: real dates + booking intent) vs "Contact" (a
  // click with no real signal of intent) — see PreContactModal for why.
  if (input.metaEventId) {
    await sendMetaEvent({
      name: input.metaQualified ? "Schedule" : "Contact",
      eventId: input.metaEventId,
      eventSourceUrl: input.pageUrl,
      user: { email: input.email, phone: input.phone, name: input.name },
      custom: {
        content_name: input.source?.trim() || "contact_form",
        ...(input.metaValue ? { currency: "PKR", value: input.metaValue } : {}),
      },
    });
  }

  await notifyInquiry({
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || null,
    message: input.message?.trim() || null,
    source: input.source?.trim() || "contact_form",
  });

  return { success: true };
}

type Res = { ok: true } | { ok: false; error: string };

export async function setInquiryStatus(id: string, status: string): Promise<Res> {
  const supabase = await createClient();
  const { data: before } = await supabase
    .from("inquiries")
    .select("name, phone, email, check_in, check_out, room_interest, status")
    .eq("id", id)
    .maybeSingle();
  const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  await logActivity("inquiry.status", "inquiry", id, `→ ${status}`);

  // The moment staff mark a lead "converted" is the strongest signal Meta
  // can get: a specific past Contact/WhatsApp click we now know for certain
  // became a real, paying guest — not a rare on-site booking-form event, but
  // still a confirmed one. Only fires on the transition into "converted" so
  // re-saving an already-converted inquiry doesn't resend it.
  if (status === "converted" && before && before.status !== "converted") {
    const nights =
      before.check_in && before.check_out
        ? Math.max(1, Math.round((+new Date(before.check_out) - +new Date(before.check_in)) / 86400000))
        : 1;
    await sendMetaEvent({
      name: "Lead",
      eventId: crypto.randomUUID(),
      user: { name: before.name, phone: before.phone, email: before.email },
      custom: {
        currency: "PKR",
        value: Math.min(...fallbackRooms.map((r) => r.price)) * nights,
        content_name: before.room_interest ?? undefined,
      },
    });
  }

  revalidatePath("/admin/inquiries");
  return { ok: true };
}

export async function deleteInquiry(id: string): Promise<Res> {
  const supabase = await createClient();
  const { error } = await supabase.from("inquiries").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  await logActivity("inquiry.delete", "inquiry", id);
  revalidatePath("/admin/inquiries");
  return { ok: true };
}

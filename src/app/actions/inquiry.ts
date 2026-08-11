"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";

export type InquiryInput = {
  name: string;
  phone: string;
  email?: string;
  roomInterest?: string;
  checkIn?: string;
  checkOut?: string;
  message?: string;
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
    source: "contact_form",
    status: "new",
  });
  if (error) return { success: false, error: "Could not send your message. Please try WhatsApp or call us." };
  return { success: true };
}

type Res = { ok: true } | { ok: false; error: string };

export async function setInquiryStatus(id: string, status: string): Promise<Res> {
  const supabase = await createClient();
  const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/inquiries");
  return { ok: true };
}

export async function deleteInquiry(id: string): Promise<Res> {
  const supabase = await createClient();
  const { error } = await supabase.from("inquiries").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/inquiries");
  return { ok: true };
}

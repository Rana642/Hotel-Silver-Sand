"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/app/actions/activity";

type Res = { ok: true; id?: string } | { ok: false; error: string };

export type DealInput = {
  name: string;
  discount_percent: number;
  start_date: string;
  end_date: string;
  room_id: string | null;
  refundable: boolean;
  free_cancel_days: number;
  is_active: boolean;
  priority: number;
};

function clean(input: DealInput): DealInput {
  return {
    name: input.name.trim(),
    discount_percent: Math.max(0, Math.min(90, Number(input.discount_percent) || 0)),
    start_date: input.start_date,
    end_date: input.end_date,
    room_id: input.room_id || null,
    refundable: !!input.refundable,
    free_cancel_days: Math.max(0, Math.floor(Number(input.free_cancel_days) || 0)),
    is_active: !!input.is_active,
    priority: Math.floor(Number(input.priority) || 0),
  };
}

export async function upsertDeal(id: string | null, input: DealInput): Promise<Res> {
  const supabase = await createClient();
  const payload = clean(input);
  if (!payload.name) return { ok: false, error: "Please enter a deal name." };
  if (!payload.start_date || !payload.end_date || payload.end_date < payload.start_date) {
    return { ok: false, error: "Please pick a valid date range." };
  }

  if (id) {
    const { error } = await supabase.from("rate_deals").update(payload).eq("id", id);
    if (error) return { ok: false, error: error.message };
    await logActivity("deal.update", "deal", id, payload.name);
  } else {
    const { data, error } = await supabase.from("rate_deals").insert(payload).select("id").single();
    if (error) return { ok: false, error: error.message };
    await logActivity("deal.create", "deal", data.id, payload.name);
    id = data.id;
  }
  revalidatePath("/admin/deals");
  revalidatePath("/reservations");
  return { ok: true, id: id ?? undefined };
}

export async function deleteDeal(id: string): Promise<Res> {
  const supabase = await createClient();
  const { error } = await supabase.from("rate_deals").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  await logActivity("deal.delete", "deal", id);
  revalidatePath("/admin/deals");
  revalidatePath("/reservations");
  return { ok: true };
}

export async function toggleDeal(id: string, is_active: boolean): Promise<Res> {
  const supabase = await createClient();
  const { error } = await supabase.from("rate_deals").update({ is_active }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/deals");
  revalidatePath("/reservations");
  return { ok: true };
}

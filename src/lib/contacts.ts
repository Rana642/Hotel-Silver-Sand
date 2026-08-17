import { createClient } from "@/lib/supabase/server";

export type Contact = {
  key: string;
  name: string;
  phone: string | null;
  email: string | null;
  bookings: number;
  lastStay: string | null; // latest check-in date
  totalSpent: number; // sum of non-cancelled booking totals
  lastActivity: string; // most recent created_at
};

type Row = {
  guest_name: string;
  guest_phone: string | null;
  guest_email: string | null;
  check_in: string | null;
  created_at: string;
  total: number | null;
  status: string;
};

/** A stable key to merge the same guest across bookings: phone digits, else email, else name. */
function contactKey(r: Row): string {
  const digits = (r.guest_phone ?? "").replace(/\D/g, "");
  if (digits.length >= 7) return "p:" + digits.slice(-10);
  if (r.guest_email) return "e:" + r.guest_email.trim().toLowerCase();
  return "n:" + (r.guest_name ?? "").trim().toLowerCase();
}

/** Build the contact directory from bookings (most-recent activity first). */
export async function getContacts(): Promise<Contact[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("guest_name, guest_phone, guest_email, check_in, created_at, total, status")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Row[];
  const map = new Map<string, Contact>();

  for (const r of rows) {
    const key = contactKey(r);
    const counts = r.status !== "cancelled" && r.status !== "no_show" ? Number(r.total) || 0 : 0;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        key,
        name: r.guest_name,
        phone: r.guest_phone,
        email: r.guest_email,
        bookings: 1,
        lastStay: r.check_in,
        totalSpent: counts,
        lastActivity: r.created_at,
      });
      continue;
    }
    existing.bookings += 1;
    existing.totalSpent += counts;
    // rows are newest-first, so the first-seen values are already the latest;
    // only backfill anything missing from older rows.
    if (!existing.phone && r.guest_phone) existing.phone = r.guest_phone;
    if (!existing.email && r.guest_email) existing.email = r.guest_email;
    if (r.check_in && (!existing.lastStay || r.check_in > existing.lastStay)) existing.lastStay = r.check_in;
  }

  return [...map.values()];
}

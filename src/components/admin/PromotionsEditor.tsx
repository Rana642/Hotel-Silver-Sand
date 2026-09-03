"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Save, Trash2, Plus, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { upsertPromotion, deletePromotion, type PromotionInput } from "@/app/actions/promotion";

export type Promotion = {
  id: string;
  slug: string;
  title: string;
  short_desc: string | null;
  description: string | null;
  image: string | null;
  badge: string | null;
  benefits: string[] | null;
  coupon_code: string | null;
  is_active: boolean;
  sort_order: number;
  discount_percent?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  room_ids?: string[] | null;
  lead_time_type?: "none" | "early_bird" | "last_minute" | null;
  lead_time_days?: number | null;
  refundable?: boolean | null;
  free_cancel_days?: number | null;
  priority?: number | null;
};

export type RoomOpt = { id: string; name: string };

const field = "w-full rounded-none border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40";
const lbl = "mb-1 block text-xs font-semibold text-navy";
const linesToArr = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

function Row({ initial, isAdmin, rooms }: { initial: Promotion | null; isAdmin: boolean; rooms: RoomOpt[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [f, setF] = useState({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    short_desc: initial?.short_desc ?? "",
    description: initial?.description ?? "",
    image: initial?.image ?? "",
    badge: initial?.badge ?? "",
    benefits: (initial?.benefits ?? []).join("\n"),
    coupon_code: initial?.coupon_code ?? "",
    is_active: initial?.is_active ?? true,
    sort_order: String(initial?.sort_order ?? 0),
    discount_percent: String(initial?.discount_percent ?? 0),
    start_date: initial?.start_date ?? "",
    end_date: initial?.end_date ?? "",
    lead_time_type: (initial?.lead_time_type ?? "none") as "none" | "early_bird" | "last_minute",
    lead_time_days: String(initial?.lead_time_days ?? 7),
    refundable: initial?.refundable ?? true,
    free_cancel_days: String(initial?.free_cancel_days ?? 2),
    priority: String(initial?.priority ?? 0),
  });
  const [roomIds, setRoomIds] = useState<string[]>(initial?.room_ids ?? []);
  const set = (k: keyof typeof f, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));
  const toggleRoom = (id: string) =>
    setRoomIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  function save() {
    setError(null); setMsg(null);
    if (!f.title.trim() || !f.slug.trim()) { setError("Slug and title are required."); return; }
    const input: PromotionInput = {
      slug: f.slug, title: f.title, short_desc: f.short_desc, description: f.description,
      image: f.image || null, badge: f.badge, benefits: linesToArr(f.benefits),
      coupon_code: f.coupon_code.trim() ? f.coupon_code.trim().toUpperCase() : null,
      is_active: f.is_active, sort_order: Number(f.sort_order) || 0,
      discount_percent: Number(f.discount_percent) || 0,
      start_date: f.lead_time_type === "none" ? f.start_date || null : null,
      end_date: f.lead_time_type === "none" ? f.end_date || null : null,
      room_ids: roomIds,
      lead_time_type: f.lead_time_type,
      lead_time_days: Number(f.lead_time_days) || 0,
      refundable: f.refundable,
      free_cancel_days: Number(f.free_cancel_days) || 0,
      priority: Number(f.priority) || 0,
    };
    start(async () => {
      const res = await upsertPromotion(initial?.id ?? null, input);
      if (!res.ok) { setError(res.error); return; }
      setMsg("Saved ✓"); router.refresh(); setTimeout(() => setMsg(null), 2000);
    });
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    setUploading(true); setError(null);
    const supabase = createClient();
    const file = e.target.files[0];
    const path = `promotions/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error: upErr } = await supabase.storage.from("site-images").upload(path, file);
    if (upErr) { setError("Upload failed: " + upErr.message); setUploading(false); return; }
    const { data } = supabase.storage.from("site-images").getPublicUrl(path);
    set("image", data.publicUrl);
    setUploading(false);
    e.target.value = "";
  }

  return (
    <div className="border border-gray-100 bg-white p-5 shadow-card">
      <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden border border-gray-200 bg-cream">
            {f.image && <Image src={f.image} alt={f.title} fill className="object-cover" sizes="200px" />}
          </div>
          <label className="mt-2 flex cursor-pointer items-center justify-center gap-1.5 border border-dashed border-gray-300 py-2 text-xs font-semibold text-slate hover:border-gold hover:text-navy">
            <Upload className="size-4" /> {uploading ? "Uploading…" : "Change image"}
            <input type="file" accept="image/*" onChange={onUpload} className="hidden" disabled={uploading} />
          </label>
        </div>

        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block"><span className={lbl}>Title</span><input value={f.title} onChange={(e) => set("title", e.target.value)} className={field} /></label>
            <label className="block"><span className={lbl}>Slug (url)</span><input value={f.slug} onChange={(e) => set("slug", e.target.value)} placeholder="early-booking-offer" className={field} /></label>
            <label className="block"><span className={lbl}>Badge (e.g. 20% Off)</span><input value={f.badge} onChange={(e) => set("badge", e.target.value)} className={field} /></label>
            <label className="block"><span className={lbl}>Coupon code (optional)</span><input value={f.coupon_code} onChange={(e) => set("coupon_code", e.target.value)} placeholder="e.g. EARLY10" className={field + " uppercase"} /></label>
          </div>
          <label className="mt-3 block"><span className={lbl}>Short description (card)</span><textarea rows={2} value={f.short_desc} onChange={(e) => set("short_desc", e.target.value)} className={field + " resize-y"} /></label>
          <label className="mt-3 block"><span className={lbl}>Full description (blank line = new paragraph)</span><textarea rows={5} value={f.description} onChange={(e) => set("description", e.target.value)} className={field + " resize-y"} /></label>
          <label className="mt-3 block"><span className={lbl}>Benefits (one per line)</span><textarea rows={4} value={f.benefits} onChange={(e) => set("benefits", e.target.value)} className={field + " resize-y font-mono text-xs"} /></label>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate"><input type="checkbox" checked={f.is_active} onChange={(e) => set("is_active", e.target.checked)} className="size-4 accent-[#d9a928]" /> Active</label>
            <label className="flex items-center gap-2 text-sm text-slate">Sort <input type="number" value={f.sort_order} onChange={(e) => set("sort_order", e.target.value)} className={field + " w-20"} /></label>
          </div>

          {/* Deal (optional) — auto discount for a check-in date range */}
          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="text-sm font-bold text-navy">Automatic Discount (optional)</p>
            <p className="mb-3 text-xs text-slate">
              Set a discount % and check-in date range to make this promotion apply automatically on the booking page.
              Leave discount at 0 (or dates blank) to keep it as a display-only promotion.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block"><span className={lbl}>Discount %</span><input type="number" min={0} max={90} value={f.discount_percent} onChange={(e) => set("discount_percent", e.target.value)} className={field} /></label>
              <label className="block sm:col-span-1 lg:col-span-2"><span className={lbl}>When does it apply?</span>
                <select value={f.lead_time_type} onChange={(e) => set("lead_time_type", e.target.value)} className={field}>
                  <option value="none">Fixed check-in date range</option>
                  <option value="early_bird">Early Bird — book at least N days before check-in</option>
                  <option value="last_minute">Last Minute — book within N days of check-in</option>
                </select>
              </label>
            </div>
            {f.lead_time_type === "none" ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block"><span className={lbl}>Check-in from</span><input type="date" value={f.start_date} onChange={(e) => set("start_date", e.target.value)} className={field} /></label>
                <label className="block"><span className={lbl}>Check-in to</span><input type="date" min={f.start_date} value={f.end_date} onChange={(e) => set("end_date", e.target.value)} className={field} /></label>
              </div>
            ) : (
              <div className="mt-3">
                <label className="block max-w-xs"><span className={lbl}>{f.lead_time_type === "early_bird" ? "Book at least N days before check-in" : "Book within N days of check-in"}</span>
                  <input type="number" min={0} value={f.lead_time_days} onChange={(e) => set("lead_time_days", e.target.value)} className={field} />
                </label>
                <p className="mt-1 text-xs text-slate">
                  {f.lead_time_type === "early_bird"
                    ? `Guest gets this discount automatically when they book ${f.lead_time_days || "N"}+ days before check-in.`
                    : `Guest gets this discount automatically when check-in is within ${f.lead_time_days || "N"} day(s) of booking.`}
                </p>
              </div>
            )}
            <div className="mt-3">
              <span className={lbl}>Applies to (tick rooms — leave all unticked = all rooms)</span>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {rooms.map((r) => (
                  <label key={r.id} className="flex cursor-pointer items-center gap-2 text-sm text-navy">
                    <input type="checkbox" checked={roomIds.includes(r.id)} onChange={() => toggleRoom(r.id)} className="size-4 accent-[#d9a928]" />
                    {r.name}
                  </label>
                ))}
                {rooms.length === 0 && <span className="text-sm text-slate">No rooms found.</span>}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-slate"><input type="checkbox" checked={f.refundable} onChange={(e) => set("refundable", e.target.checked)} className="size-4 accent-[#d9a928]" /> Free cancellation (uncheck = Non-Refundable)</label>
              {f.refundable && (
                <label className="flex items-center gap-2 text-sm text-slate">Free until (days before)<input type="number" min={0} value={f.free_cancel_days} onChange={(e) => set("free_cancel_days", e.target.value)} className={field + " w-20"} /></label>
              )}
              <label className="flex items-center gap-2 text-sm text-slate">Priority <input type="number" value={f.priority} onChange={(e) => set("priority", e.target.value)} className={field + " w-20"} /></label>
            </div>
          </div>
        </div>
      </div>

      {(error || msg) && <p className={`mt-3 text-sm ${error ? "text-red-600" : "text-green-600"}`}>{error ?? msg}</p>}

      <div className="mt-4 flex items-center gap-3">
        <button onClick={save} disabled={pending} className="flex items-center gap-2 bg-gold px-4 py-2 text-sm font-semibold text-navy-dark hover:brightness-95 disabled:opacity-60">
          <Save className="size-4" /> {pending ? "Saving…" : initial ? "Save" : "Create"}
        </button>
        {initial && isAdmin && (
          <button onClick={() => { if (window.confirm("Delete this promotion?")) start(async () => { await deletePromotion(initial.id); router.refresh(); }); }} disabled={pending} className="flex items-center gap-2 border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-60">
            <Trash2 className="size-4" /> Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default function PromotionsEditor({ promotions, isAdmin, rooms }: { promotions: Promotion[]; isAdmin: boolean; rooms: RoomOpt[] }) {
  const [addingNew, setAddingNew] = useState(false);
  return (
    <div className="space-y-4">
      {promotions.map((p) => <Row key={p.id} initial={p} isAdmin={isAdmin} rooms={rooms} />)}
      {addingNew ? (
        <Row initial={null} isAdmin={isAdmin} rooms={rooms} />
      ) : (
        <button onClick={() => setAddingNew(true)} className="flex w-full items-center justify-center gap-2 border-2 border-dashed border-gray-300 py-4 text-sm font-semibold text-slate hover:border-gold hover:text-navy">
          <Plus className="size-4" /> Add promotion
        </button>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Save, Trash2, Star, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { upsertRoom, deleteRoom, addRoomImage, deleteRoomImage, setFeaturedImage, type RoomInput } from "@/app/actions/room";

export type RoomFull = {
  id: string;
  slug: string;
  name: string;
  capacity: string | null;
  max_adults: number;
  max_children: number;
  price_per_night: number;
  original_price: number | null;
  gst_percent: number;
  size_sqft: number | null;
  view: string | null;
  description: string | null;
  amenities: string[] | null;
  ideal_for: string | null;
  why_book: string[] | null;
  good_to_know: Record<string, string> | null;
  nearby: { place: string; distance: string; category: string }[] | null;
  faqs: { q: string; a: string }[] | null;
  is_active: boolean;
  sort_order: number;
};

export type RoomImg = { id: string; url: string; alt: string | null; is_featured: boolean; sort_order: number };

const field = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40";
const lbl = "mb-1 block text-xs font-semibold text-navy";
const linesToArr = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
const arrToLines = (a?: string[] | null) => (a ?? []).join("\n");

export default function RoomForm({ room, images }: { room: RoomFull | null; images: RoomImg[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [lowRes, setLowRes] = useState<string[]>([]);

  const [f, setF] = useState({
    slug: room?.slug ?? "",
    name: room?.name ?? "",
    capacity: room?.capacity ?? "",
    max_adults: String(room?.max_adults ?? 2),
    max_children: String(room?.max_children ?? 0),
    price_per_night: String(room?.price_per_night ?? 0),
    original_price: room?.original_price ? String(room.original_price) : "",
    gst_percent: String(room?.gst_percent ?? 16),
    size_sqft: room?.size_sqft ? String(room.size_sqft) : "",
    view: room?.view ?? "City View",
    description: room?.description ?? "",
    amenities: arrToLines(room?.amenities),
    ideal_for: room?.ideal_for ?? "",
    why_book: arrToLines(room?.why_book),
    good_to_know: Object.entries(room?.good_to_know ?? {}).map(([k, v]) => `${k}: ${v}`).join("\n"),
    nearby: (room?.nearby ?? []).map((n) => `${n.place} | ${n.distance} | ${n.category}`).join("\n"),
    faqs: (room?.faqs ?? []).map((q) => `${q.q} | ${q.a}`).join("\n"),
    is_active: room?.is_active ?? true,
    sort_order: String(room?.sort_order ?? 0),
  });
  const set = (k: keyof typeof f, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));

  function buildInput(): RoomInput {
    const good: Record<string, string> = {};
    linesToArr(f.good_to_know).forEach((l) => {
      const i = l.indexOf(":");
      if (i > 0) good[l.slice(0, i).trim()] = l.slice(i + 1).trim();
    });
    const nearby = linesToArr(f.nearby).map((l) => {
      const [place, distance, category] = l.split("|").map((x) => x.trim());
      return { place: place ?? "", distance: distance ?? "", category: category ?? "" };
    });
    const faqs = linesToArr(f.faqs).map((l) => {
      const [q, a] = l.split("|").map((x) => x.trim());
      return { q: q ?? "", a: a ?? "" };
    });
    return {
      slug: f.slug, name: f.name, capacity: f.capacity,
      max_adults: Number(f.max_adults) || 1, max_children: Number(f.max_children) || 0,
      price_per_night: Number(f.price_per_night) || 0,
      original_price: f.original_price ? Number(f.original_price) : null,
      gst_percent: Number(f.gst_percent) || 0,
      size_sqft: f.size_sqft ? Number(f.size_sqft) : null,
      view: f.view, description: f.description,
      amenities: linesToArr(f.amenities), ideal_for: f.ideal_for,
      why_book: linesToArr(f.why_book), good_to_know: good, nearby, faqs,
      is_active: f.is_active, sort_order: Number(f.sort_order) || 0,
    };
  }

  function save() {
    setError(null);
    if (!f.name.trim() || !f.slug.trim()) { setError("Name and slug are required."); return; }
    start(async () => {
      const res = await upsertRoom(room?.id ?? null, buildInput());
      if (!res.ok) { setError(res.error); return; }
      if (!room && res.id) router.push(`/admin/rooms/${res.id}`);
      else router.refresh();
    });
  }

  /** Below this the photo visibly softens in the room gallery, which renders ~720px wide at 2x. */
  const MIN_IMAGE_WIDTH = 1600;

  /** Read a file's real pixel dimensions before it goes to storage. */
  function readDimensions(file: File) {
    return new Promise<{ width: number; height: number }>((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ width: 0, height: 0 });
      };
      img.src = url;
    });
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!room || !e.target.files?.length) return;
    setError(null);
    setLowRes([]);
    setUploading(true);
    const supabase = createClient();
    const small: string[] = [];
    for (const file of Array.from(e.target.files)) {
      // Nothing here compresses the file — whatever is uploaded is what guests
      // see. Warn when the source is already too small to look sharp.
      const { width, height } = await readDimensions(file);
      if (width > 0 && width < MIN_IMAGE_WIDTH) small.push(`${file.name} — ${width}×${height}`);

      const path = `${room.id}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("room-images").upload(path, file, { upsert: false });
      if (upErr) { setError("Upload failed: " + upErr.message); break; }
      const { data } = supabase.storage.from("room-images").getPublicUrl(path);
      await addRoomImage(room.id, data.publicUrl, f.name);
    }
    setLowRes(small);
    setUploading(false);
    e.target.value = "";
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Images */}
      {room && (
        <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-card">
          <p className="font-heading font-bold text-navy">Images</p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((img) => (
              <div key={img.id} className="group relative aspect-[4/3] overflow-hidden rounded-md border border-gray-200">
                <Image src={img.url} alt={img.alt ?? ""} fill className="object-cover" sizes="200px" />
                {img.is_featured && (
                  <span className="absolute left-1 top-1 rounded bg-gold px-1.5 py-0.5 text-[10px] font-bold text-navy-dark">Featured</span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 p-1 opacity-0 transition group-hover:opacity-100">
                  <button onClick={() => start(async () => { await setFeaturedImage(img.id, room.id); router.refresh(); })} className="text-white" aria-label="Set featured"><Star className="size-4" /></button>
                  <button onClick={() => start(async () => { await deleteRoomImage(img.id, room.id); router.refresh(); })} className="text-red-300" aria-label="Delete image"><Trash2 className="size-4" /></button>
                </div>
              </div>
            ))}
            <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-gray-300 text-sm text-slate hover:border-gold">
              <Upload className="size-5" />
              {uploading ? "Uploading…" : "Upload"}
              <input type="file" accept="image/*" multiple onChange={onUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
          <p className="mt-2 text-xs text-slate">
            First/featured image is used as the card thumbnail. Upload the original photo — at least{" "}
            {MIN_IMAGE_WIDTH}px wide. Nothing here compresses it, so a picture sent through WhatsApp
            arrives already shrunk and will look soft on the room page.
          </p>
          {lowRes.length > 0 && (
            <div className="mt-3 border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
              <p className="font-semibold">
                Uploaded, but {lowRes.length === 1 ? "this photo is" : "these photos are"} smaller than{" "}
                {MIN_IMAGE_WIDTH}px wide and will look soft:
              </p>
              <ul className="mt-1 list-inside list-disc">
                {lowRes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              <p className="mt-1.5">
                Replace with the original from the camera or phone gallery, not a forwarded copy.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Core fields */}
      <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-card">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className={lbl}>Name</span><input value={f.name} onChange={(e) => set("name", e.target.value)} className={field} /></label>
          <label className="block"><span className={lbl}>Slug (url)</span><input value={f.slug} onChange={(e) => set("slug", e.target.value)} placeholder="deluxe-king-room" className={field} /></label>
          <label className="block"><span className={lbl}>Capacity label</span><input value={f.capacity} onChange={(e) => set("capacity", e.target.value)} placeholder="2 Adults" className={field} /></label>
          <label className="block"><span className={lbl}>View</span><input value={f.view} onChange={(e) => set("view", e.target.value)} className={field} /></label>
          <label className="block"><span className={lbl}>Max adults</span><input type="number" value={f.max_adults} onChange={(e) => set("max_adults", e.target.value)} className={field} /></label>
          <label className="block"><span className={lbl}>Max children</span><input type="number" value={f.max_children} onChange={(e) => set("max_children", e.target.value)} className={field} /></label>
          <label className="block"><span className={lbl}>Price / night (PKR)</span><input type="number" value={f.price_per_night} onChange={(e) => set("price_per_night", e.target.value)} className={field} /></label>
          <label className="block"><span className={lbl}>Original price (optional)</span><input type="number" value={f.original_price} onChange={(e) => set("original_price", e.target.value)} className={field} /></label>
          <label className="block"><span className={lbl}>GST % (shown as note)</span><input type="number" value={f.gst_percent} onChange={(e) => set("gst_percent", e.target.value)} className={field} /></label>
          <label className="block"><span className={lbl}>Room size (sq ft)</span><input type="number" value={f.size_sqft} onChange={(e) => set("size_sqft", e.target.value)} className={field} /></label>
          <label className="block"><span className={lbl}>Sort order</span><input type="number" value={f.sort_order} onChange={(e) => set("sort_order", e.target.value)} className={field} /></label>
          <label className="flex items-end gap-2 pb-2 text-sm text-slate"><input type="checkbox" checked={f.is_active} onChange={(e) => set("is_active", e.target.checked)} className="size-4 accent-[#d9a928]" /> Active (visible on site)</label>
        </div>
        <label className="mt-4 block"><span className={lbl}>Short description</span><textarea rows={3} value={f.description} onChange={(e) => set("description", e.target.value)} className={field + " resize-y"} /></label>
        <label className="mt-4 block"><span className={lbl}>Ideal for</span><input value={f.ideal_for} onChange={(e) => set("ideal_for", e.target.value)} className={field} /></label>
      </div>

      {/* Rich content */}
      <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-card">
        <p className="font-heading font-bold text-navy">Details</p>
        <label className="mt-3 block"><span className={lbl}>Amenities (one per line)</span><textarea rows={4} value={f.amenities} onChange={(e) => set("amenities", e.target.value)} className={field + " resize-y font-mono text-xs"} /></label>
        <label className="mt-4 block"><span className={lbl}>Why book this room (one point per line)</span><textarea rows={4} value={f.why_book} onChange={(e) => set("why_book", e.target.value)} className={field + " resize-y font-mono text-xs"} /></label>
        <label className="mt-4 block"><span className={lbl}>Good to know (one per line — Label: Value)</span><textarea rows={5} value={f.good_to_know} onChange={(e) => set("good_to_know", e.target.value)} placeholder={"Check-in: 24 hours\nParking: Free on site"} className={field + " resize-y font-mono text-xs"} /></label>
        <label className="mt-4 block"><span className={lbl}>Nearby (one per line — Place | Distance | Category)</span><textarea rows={4} value={f.nearby} onChange={(e) => set("nearby", e.target.value)} placeholder={"Multan Airport | 8 min | Airport"} className={field + " resize-y font-mono text-xs"} /></label>
        <label className="mt-4 block"><span className={lbl}>FAQs (one per line — Question | Answer)</span><textarea rows={4} value={f.faqs} onChange={(e) => set("faqs", e.target.value)} placeholder={"How many guests? | Up to 2 adults."} className={field + " resize-y font-mono text-xs"} /></label>
      </div>

      {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={pending} className="flex items-center gap-2 rounded-md bg-gold px-6 py-2.5 text-sm font-semibold text-navy-dark hover:brightness-95 disabled:opacity-60">
          <Save className="size-4" /> {pending ? "Saving…" : room ? "Save Changes" : "Create Room"}
        </button>
        {room && (
          <button
            onClick={() => { if (window.confirm("Delete this room? This cannot be undone.")) start(async () => { const r = await deleteRoom(room.id); if (!r.ok) setError(r.error); else router.push("/admin/rooms"); }); }}
            disabled={pending}
            className="flex items-center gap-2 rounded-md border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-60"
          >
            <Trash2 className="size-4" /> Delete
          </button>
        )}
      </div>
    </div>
  );
}

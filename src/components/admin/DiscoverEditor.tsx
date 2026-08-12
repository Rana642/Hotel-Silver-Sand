"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Save, Trash2, Plus, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { upsertDestination, deleteDestination } from "@/app/actions/destination";

export type Destination = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string | null;
  is_active: boolean;
  sort_order: number;
};

const field = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40";
const lbl = "mb-1 block text-xs font-semibold text-navy";

function Row({ initial, isAdmin }: { initial: Destination | null; isAdmin: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [f, setF] = useState({
    slug: initial?.slug ?? "", title: initial?.title ?? "", description: initial?.description ?? "",
    image: initial?.image ?? "", is_active: initial?.is_active ?? true, sort_order: String(initial?.sort_order ?? 0),
  });
  const set = (k: keyof typeof f, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));

  function save() {
    setError(null); setMsg(null);
    if (!f.title.trim() || !f.slug.trim()) { setError("Slug and title are required."); return; }
    start(async () => {
      const res = await upsertDestination(initial?.id ?? null, {
        slug: f.slug, title: f.title, description: f.description,
        image: f.image || null, is_active: f.is_active, sort_order: Number(f.sort_order) || 0,
      });
      if (!res.ok) { setError(res.error); return; }
      setMsg("Saved ✓");
      router.refresh();
      setTimeout(() => setMsg(null), 2000);
    });
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    setUploading(true); setError(null);
    const supabase = createClient();
    const file = e.target.files[0];
    const path = `discover/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error: upErr } = await supabase.storage.from("site-images").upload(path, file);
    if (upErr) { setError("Upload failed: " + upErr.message); setUploading(false); return; }
    const { data } = supabase.storage.from("site-images").getPublicUrl(path);
    set("image", data.publicUrl);
    setUploading(false);
    e.target.value = "";
  }

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-card">
      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-gray-200 bg-cream">
            {f.image && <Image src={f.image} alt={f.title} fill className="object-cover" sizes="200px" />}
          </div>
          <label className="mt-2 flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-dashed border-gray-300 py-2 text-xs font-semibold text-slate hover:border-gold hover:text-navy">
            <Upload className="size-4" /> {uploading ? "Uploading…" : "Change image"}
            <input type="file" accept="image/*" onChange={onUpload} className="hidden" disabled={uploading} />
          </label>
        </div>

        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block"><span className={lbl}>Title</span><input value={f.title} onChange={(e) => set("title", e.target.value)} className={field} /></label>
            <label className="block"><span className={lbl}>Slug (url)</span><input value={f.slug} onChange={(e) => set("slug", e.target.value)} placeholder="shah-rukn-e-alam" className={field} /></label>
          </div>
          <label className="mt-3 block"><span className={lbl}>Description</span><textarea rows={3} value={f.description} onChange={(e) => set("description", e.target.value)} className={field + " resize-y"} /></label>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate"><input type="checkbox" checked={f.is_active} onChange={(e) => set("is_active", e.target.checked)} className="size-4 accent-[#d9a928]" /> Active</label>
            <label className="flex items-center gap-2 text-sm text-slate">Sort <input type="number" value={f.sort_order} onChange={(e) => set("sort_order", e.target.value)} className={field + " w-20"} /></label>
          </div>
        </div>
      </div>

      {(error || msg) && <p className={`mt-3 text-sm ${error ? "text-red-600" : "text-green-600"}`}>{error ?? msg}</p>}

      <div className="mt-4 flex items-center gap-3">
        <button onClick={save} disabled={pending} className="flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-navy-dark hover:brightness-95 disabled:opacity-60">
          <Save className="size-4" /> {pending ? "Saving…" : initial ? "Save" : "Create"}
        </button>
        {initial && isAdmin && (
          <button onClick={() => { if (window.confirm("Delete this destination?")) start(async () => { await deleteDestination(initial.id); router.refresh(); }); }} disabled={pending} className="flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-60">
            <Trash2 className="size-4" /> Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default function DiscoverEditor({ destinations, isAdmin }: { destinations: Destination[]; isAdmin: boolean }) {
  const [addingNew, setAddingNew] = useState(false);
  return (
    <div className="space-y-4">
      {destinations.map((d) => <Row key={d.id} initial={d} isAdmin={isAdmin} />)}
      {addingNew ? (
        <Row initial={null} isAdmin={isAdmin} />
      ) : (
        <button onClick={() => setAddingNew(true)} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-4 text-sm font-semibold text-slate hover:border-gold hover:text-navy">
          <Plus className="size-4" /> Add destination
        </button>
      )}
    </div>
  );
}

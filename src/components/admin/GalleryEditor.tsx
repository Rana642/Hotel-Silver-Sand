"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, Trash2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { addGalleryImage, updateGalleryImage, deleteGalleryImage } from "@/app/actions/gallery";

export type GalleryItem = {
  id: string;
  url: string;
  alt: string | null;
  category: string;
  is_visible: boolean;
  sort_order: number;
};

const CATEGORIES = ["Exterior", "Reception", "Rooms", "Hallways", "Parking", "Surroundings"];

export default function GalleryEditor({ items, isAdmin }: { items: GalleryItem[]; isAdmin: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [uploadCategory, setUploadCategory] = useState(CATEGORIES[0]);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<string>("All");
  const [error, setError] = useState<string | null>(null);

  const filtered = filter === "All" ? items : items.filter((i) => i.category === filter);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    setError(null);
    setUploading(true);
    const supabase = createClient();
    for (const file of Array.from(e.target.files)) {
      const path = `gallery/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("site-images").upload(path, file);
      if (upErr) { setError("Upload failed: " + upErr.message); break; }
      const { data } = supabase.storage.from("site-images").getPublicUrl(path);
      await addGalleryImage(data.publicUrl, uploadCategory, file.name);
    }
    setUploading(false);
    e.target.value = "";
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Upload */}
      <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-card">
        <p className="font-heading font-bold text-navy">Upload Photos</p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-navy">Category</span>
            <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-navy-dark hover:brightness-95">
            <Upload className="size-4" /> {uploading ? "Uploading…" : "Choose files"}
            <input type="file" multiple accept="image/*" onChange={onUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {["All", ...CATEGORIES].map((c) => (
          <button key={c} onClick={() => setFilter(c)} className={`rounded-full border px-3 py-1 text-sm font-medium ${filter === c ? "border-navy bg-navy text-white" : "border-gray-200 bg-white text-navy"}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="rounded-lg border border-gray-100 bg-white p-6 text-center text-slate shadow-card">No images.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((img) => (
            <div key={img.id} className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-card">
              <div className={`relative aspect-[4/3] ${img.is_visible ? "" : "opacity-50"}`}>
                <Image src={img.url} alt={img.alt ?? ""} fill className="object-cover" sizes="300px" />
              </div>
              <div className="flex items-center justify-between gap-1 p-2">
                <select
                  value={img.category}
                  disabled={pending}
                  onChange={(e) => start(async () => { await updateGalleryImage(img.id, { category: e.target.value }); router.refresh(); })}
                  className="max-w-full flex-1 truncate rounded border border-gray-200 px-1.5 py-1 text-xs text-navy"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <button
                  onClick={() => start(async () => { await updateGalleryImage(img.id, { is_visible: !img.is_visible }); router.refresh(); })}
                  disabled={pending}
                  className="rounded p-1.5 text-slate hover:bg-cream"
                  aria-label={img.is_visible ? "Hide" : "Show"}
                >
                  {img.is_visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>
                {isAdmin && (
                  <button
                    onClick={() => { if (window.confirm("Delete this photo?")) start(async () => { await deleteGalleryImage(img.id); router.refresh(); }); }}
                    disabled={pending}
                    className="rounded p-1.5 text-red-500 hover:bg-red-50"
                    aria-label="Delete"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

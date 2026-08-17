"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { addHeroImage, deleteHeroImage, toggleHeroImage, moveHeroImage } from "@/app/actions/hero";

export type HeroImg = { id: string; url: string; alt: string | null; is_active: boolean; sort_order: number };

export default function HeroImagesEditor({ images }: { images: HeroImg[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    setError(null);
    setUploading(true);
    const supabase = createClient();
    for (const file of Array.from(e.target.files)) {
      const path = `hero/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("site-images").upload(path, file);
      if (upErr) { setError("Upload failed: " + upErr.message); break; }
      const { data } = supabase.storage.from("site-images").getPublicUrl(path);
      await addHeroImage(data.publicUrl, file.name);
    }
    setUploading(false);
    e.target.value = "";
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate">Images auto-rotate in the homepage hero. Upload wide, high-quality shots.</p>
        <label className="flex cursor-pointer items-center gap-2 bg-gold px-4 py-2 text-sm font-semibold text-navy-dark hover:brightness-95">
          <Upload className="size-4" /> {uploading ? "Uploading…" : "Add images"}
          <input type="file" multiple accept="image/*" onChange={onUpload} className="hidden" disabled={uploading} />
        </label>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {images.length === 0 ? (
        <p className="mt-4 border border-dashed border-gray-300 p-6 text-center text-sm text-slate">
          No hero images yet — the site shows the default building photo. Add images above.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((img, idx) => (
            <div key={img.id} className="overflow-hidden border border-gray-100 bg-white shadow-card">
              <div className={`relative aspect-[16/9] ${img.is_active ? "" : "opacity-50"}`}>
                <Image src={img.url} alt={img.alt ?? ""} fill className="object-cover" sizes="300px" />
                <span className="absolute left-1 top-1 bg-navy/80 px-1.5 py-0.5 text-[10px] font-bold text-white">#{idx + 1}</span>
              </div>
              <div className="flex items-center justify-between gap-1 p-2">
                <div className="flex gap-1">
                  <button onClick={() => start(async () => { await moveHeroImage(img.id, -1); router.refresh(); })} disabled={pending || idx === 0} className="p-1 text-slate hover:bg-cream disabled:opacity-30" aria-label="Move up"><ArrowUp className="size-4" /></button>
                  <button onClick={() => start(async () => { await moveHeroImage(img.id, 1); router.refresh(); })} disabled={pending || idx === images.length - 1} className="p-1 text-slate hover:bg-cream disabled:opacity-30" aria-label="Move down"><ArrowDown className="size-4" /></button>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => start(async () => { await toggleHeroImage(img.id, !img.is_active); router.refresh(); })} disabled={pending} className="p-1 text-slate hover:bg-cream" aria-label={img.is_active ? "Hide" : "Show"}>
                    {img.is_active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  </button>
                  <button onClick={() => { if (window.confirm("Delete this hero image?")) start(async () => { await deleteHeroImage(img.id); router.refresh(); }); }} disabled={pending} className="p-1 text-red-500 hover:bg-red-50" aria-label="Delete"><Trash2 className="size-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

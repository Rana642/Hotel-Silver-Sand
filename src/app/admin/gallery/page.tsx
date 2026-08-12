import { createClient } from "@/lib/supabase/server";
import { getRole } from "@/lib/auth";
import GalleryEditor, { type GalleryItem } from "@/components/admin/GalleryEditor";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const supabase = await createClient();
  const [{ data }, role] = await Promise.all([
    supabase.from("gallery_images").select("*").order("sort_order"),
    getRole(),
  ]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">Gallery</h1>
      <p className="mt-1 text-sm text-slate">Upload photos, change categories, hide or delete.</p>
      <div className="mt-6">
        <GalleryEditor items={(data ?? []) as GalleryItem[]} isAdmin={role === "admin"} />
      </div>
    </div>
  );
}

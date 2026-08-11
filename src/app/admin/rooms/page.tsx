import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { pkr } from "@/lib/format";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  name: string;
  price_per_night: number;
  original_price: number | null;
  is_active: boolean;
  room_images: { url: string; is_featured: boolean }[];
};

export default async function AdminRoomsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rooms")
    .select("id, name, price_per_night, original_price, is_active, room_images(url, is_featured)")
    .order("sort_order");
  const rooms = (data ?? []) as Row[];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy">Rooms</h1>
          <p className="mt-1 text-sm text-slate">Manage room details, pricing and images.</p>
        </div>
        <Link href="/admin/rooms/new" className="inline-flex items-center gap-1.5 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-navy-dark hover:brightness-95">
          <Plus className="size-4" /> New Room
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((r) => {
          const img = r.room_images?.find((i) => i.is_featured)?.url ?? r.room_images?.[0]?.url;
          return (
            <Link key={r.id} href={`/admin/rooms/${r.id}`} className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-card transition hover:shadow-pop">
              <div className="relative aspect-[16/10] bg-cream">
                {img && <Image src={img} alt={r.name} fill className="object-cover" sizes="400px" />}
                {!r.is_active && <span className="absolute right-2 top-2 rounded bg-gray-800/80 px-2 py-0.5 text-xs font-semibold text-white">Hidden</span>}
              </div>
              <div className="p-4">
                <p className="font-heading font-bold text-navy">{r.name}</p>
                <p className="mt-1 text-sm">
                  {r.original_price && r.original_price > r.price_per_night && (
                    <span className="mr-2 text-gray-400 line-through">{pkr(r.original_price)}</span>
                  )}
                  <span className="font-bold text-gold">{pkr(r.price_per_night)}</span>
                  <span className="text-slate"> / night</span>
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

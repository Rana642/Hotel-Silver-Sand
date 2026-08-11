import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import RoomForm, { type RoomFull, type RoomImg } from "@/components/admin/RoomForm";

export const dynamic = "force-dynamic";

export default async function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: room }, { data: imgs }] = await Promise.all([
    supabase.from("rooms").select("*").eq("id", id).maybeSingle(),
    supabase.from("room_images").select("*").eq("room_id", id).order("sort_order"),
  ]);
  if (!room) notFound();

  return (
    <div>
      <Link href="/admin/rooms" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-gold">
        <ArrowLeft className="size-4" /> Back to rooms
      </Link>
      <h1 className="mt-4 font-heading text-2xl font-bold text-navy">{room.name}</h1>
      <p className="mt-1 text-sm text-slate">Edit details, pricing and images.</p>
      <div className="mt-6">
        <RoomForm room={room as RoomFull} images={(imgs ?? []) as RoomImg[]} />
      </div>
    </div>
  );
}

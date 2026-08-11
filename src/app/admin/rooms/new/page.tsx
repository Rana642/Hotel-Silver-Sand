import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RoomForm from "@/components/admin/RoomForm";

export const dynamic = "force-dynamic";

export default function NewRoomPage() {
  return (
    <div>
      <Link href="/admin/rooms" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-gold">
        <ArrowLeft className="size-4" /> Back to rooms
      </Link>
      <h1 className="mt-4 font-heading text-2xl font-bold text-navy">New Room</h1>
      <p className="mt-1 text-sm text-slate">Save the room first, then add images.</p>
      <div className="mt-6">
        <RoomForm room={null} images={[]} />
      </div>
    </div>
  );
}

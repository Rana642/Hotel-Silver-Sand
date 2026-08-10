"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { RoomRow } from "@/types";

function RoomRowEditor({ room }: { room: RoomRow }) {
  const router = useRouter();
  const [price, setPrice] = useState(String(room.price_per_night));
  const [original, setOriginal] = useState(room.original_price ? String(room.original_price) : "");
  const [active, setActive] = useState(room.is_active);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("rooms")
      .update({
        price_per_night: Number(price),
        original_price: original ? Number(original) : null,
        is_active: active,
      })
      .eq("id", room.id);
    setSaving(false);
    if (error) {
      setMsg("Error: " + error.message);
      return;
    }
    setMsg("Saved ✓");
    router.refresh();
    setTimeout(() => setMsg(null), 2500);
  }

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-navy">{room.name}</h3>
        <label className="flex items-center gap-2 text-sm text-slate">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="size-4 accent-[#d9a928]"
          />
          Active
        </label>
      </div>
      <p className="mt-1 text-xs text-slate">{room.capacity}</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-navy">Price / night (PKR)</span>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-navy">Original price (optional)</span>
          <input
            type="number"
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder="—"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </label>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-navy-dark hover:brightness-95 disabled:opacity-60"
        >
          <Save className="size-4" /> {saving ? "Saving…" : "Save"}
        </button>
        {msg && <span className="text-sm text-slate">{msg}</span>}
      </div>
    </div>
  );
}

export default function RoomsEditor({ rooms }: { rooms: RoomRow[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {rooms.map((r) => (
        <RoomRowEditor key={r.id} room={r} />
      ))}
    </div>
  );
}

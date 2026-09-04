"use client";

import { useState } from "react";
import Image from "next/image";

export default function RoomGallery({ images, name }: { images: { url: string; alt: string | null }[]; name: string }) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : [{ url: "/images/rooms/deluxe-king.svg", alt: name }];

  return (
    <div>
      {/* sizes has to match what the box actually is (~720px at desktop), or the
          browser picks a variant smaller than the space and upscales it. */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-gray-100">
        <Image
          src={list[active].url}
          alt={list[active].alt ?? name}
          fill
          priority
          quality={90}
          sizes="(max-width:1024px) 100vw, 720px"
          className="object-cover"
        />
      </div>
      {list.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {list.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden rounded-md border-2 transition ${i === active ? "border-gold" : "border-transparent opacity-80 hover:opacity-100"}`}
              aria-label={`View image ${i + 1}`}
            >
              <Image src={img.url} alt="" fill sizes="(max-width:1024px) 20vw, 150px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

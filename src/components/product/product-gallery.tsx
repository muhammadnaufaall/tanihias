"use client";

import { useState } from "react";
import { PlantImage } from "@/components/plant-image";
import { cn } from "@/lib/utils";

type Props = {
  plantType: string;
  name: string;
  photos: { id: string; url: string }[];
};

export function ProductGallery({ plantType, name, photos }: Props) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <PlantImage
        plantType={plantType}
        name={name}
        photo={photos[active]?.url}
        variant={active}
        sizes="(min-width: 768px) 50vw, 100vw"
        className="aspect-[4/3] rounded-xl border"
      />
      {photos.length > 1 && (
        <div className="grid grid-cols-3 gap-3">
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Lihat foto ${i + 1} dari ${photos.length}`}
              aria-pressed={i === active}
              className={cn(
                "overflow-hidden rounded-lg border-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                i === active ? "border-primary" : "border-transparent opacity-75 hover:opacity-100",
              )}
            >
              <PlantImage
                plantType={plantType}
                name={`${name}, foto ${i + 1}`}
                photo={p.url}
                variant={i}
                sizes="15vw"
                className="aspect-[4/3]"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

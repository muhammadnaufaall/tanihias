import Link from "next/link";
import { MapPin } from "lucide-react";
import { PlantImage } from "@/components/plant-image";
import { PlantTag } from "@/components/plant-tag";
import { formatPriceRange, formatPriceTag } from "@/lib/format";
import type { ProductWithDetails } from "@/lib/types";

// The tag tilt is derived from the id so it stays the same on every render
function tiltFromId(id: string) {
  const sum = [...id].reduce((total, char) => total + char.charCodeAt(0), 0);
  return (sum % 7) - 3;
}

export function ProductCard({ product }: { product: ProductWithDetails }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card outline-none transition-shadow hover:shadow-[0_6px_24px_-12px_rgb(23_33_27/0.35)] focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="relative">
        <PlantImage
          plantType={product.plantType.name}
          name={product.name}
          photo={product.photos[0]?.url}
          className="aspect-[4/3] [&_svg]:group-hover:scale-105"
        />
        {!product.is_available && (
          <span className="absolute top-3 left-3 rounded-full bg-foreground/85 px-2.5 py-1 text-xs font-medium text-background">
            Stok kosong
          </span>
        )}
        <PlantTag tilt={tiltFromId(product.id)} className="absolute right-4 -bottom-5">
          <span className="sr-only">Harga {formatPriceRange(product.min_price, product.max_price)}</span>
          <span aria-hidden>{formatPriceTag(product.min_price, product.max_price)}</span>
        </PlantTag>
      </div>
      {/* On narrow screens the card body drops below the tag; on wide screens they sit side by side */}
      <div className="flex flex-1 flex-col gap-1 p-4 pt-7 sm:pt-4">
        <span className="text-xs font-medium text-muted-foreground sm:pr-24">{product.plantType.name}</span>
        <h3 className="font-sans text-base leading-snug font-semibold tracking-normal">{product.name}</h3>
        <span className="mt-auto flex items-center gap-1 pt-2 text-xs text-muted-foreground">
          <MapPin aria-hidden className="size-3.5 shrink-0" />
          <span className="truncate">{product.business.business_name}</span>
        </span>
      </div>
    </Link>
  );
}

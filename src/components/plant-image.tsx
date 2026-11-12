import Image from "next/image";
import { Clover, Flower, Flower2, Leaf, type LucideIcon, Sprout, Vegan } from "lucide-react";
import { cn } from "@/lib/utils";

// Placeholder illustration while a product has no real photo, picked by plant type.
// Keys are the lowercased plant type names from the reference data (Indonesian).
const typeStyles: Record<string, { icon: LucideIcon; background: string; color: string }> = {
  "bunga potong": { icon: Flower2, background: "#f6dce6", color: "#b02a5e" },
  anggrek: { icon: Flower, background: "#e9e0f3", color: "#6b3fa0" },
  anthurium: { icon: Vegan, background: "#f7dfda", color: "#b4352a" },
  "tanaman daun": { icon: Leaf, background: "#d9e8d3", color: "#1e5b3c" },
  pakis: { icon: Sprout, background: "#dcebe0", color: "#2d6a4f" },
  "kaktus & sukulen": { icon: Clover, background: "#e7eedb", color: "#5a7a2e" },
};
const fallbackStyle = { icon: Sprout, background: "#e3eae1", color: "#1e5b3c" };

// Angle variations so several illustrated "photos" do not look identical
const iconVariants = [
  "rotate-0 scale-100",
  "-rotate-12 scale-90 translate-x-[12%]",
  "rotate-[18deg] scale-110 -translate-x-[10%]",
];

type Props = {
  plantType: string;
  name: string;
  photo?: string;
  variant?: number;
  className?: string;
  sizes?: string;
  iconSize?: string;
};

export function PlantImage({
  plantType,
  name,
  photo,
  variant = 0,
  className,
  sizes = "(min-width: 1024px) 25vw, 50vw",
  iconSize = "size-[42%]",
}: Props) {
  if (photo) {
    return (
      <div className={cn("relative overflow-hidden bg-muted", className)}>
        <Image src={photo} alt={name} fill sizes={sizes} className="object-cover" />
      </div>
    );
  }

  const style = typeStyles[plantType.toLowerCase()] ?? fallbackStyle;
  const Icon = style.icon;
  return (
    <div
      role="img"
      aria-label={`Ilustrasi ${name}`}
      className={cn("relative flex items-center justify-center overflow-hidden", className)}
      style={{
        backgroundColor: style.background,
        backgroundImage:
          "repeating-linear-gradient(90deg, rgb(255 255 255 / 0.35) 0 1px, transparent 1px 28px)",
      }}
    >
      <Icon
        aria-hidden
        strokeWidth={1.25}
        className={cn("transition-transform duration-300", iconSize, iconVariants[variant % iconVariants.length])}
        style={{ color: style.color }}
      />
    </div>
  );
}

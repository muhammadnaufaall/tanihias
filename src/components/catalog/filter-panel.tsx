"use client";

import Link from "next/link";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  plantTypes: { id: string; name: string; productCount: number }[];
  selected: string[];
  min?: number;
  max?: number;
  hasFilters: boolean;
};

// Wireframe Figure 3.9: Filter box on the left (plant type checkboxes + price range).
// The fields live inside the catalog <Form>, so their values are sent to the URL.
export function FilterPanel({ plantTypes, selected, min, max, hasFilters }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className="rounded-xl border bg-card md:self-start">
      <h2 className="hidden p-4 text-lg font-bold md:block">Filter</h2>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-2 p-4 text-left font-heading text-lg font-bold md:hidden"
      >
        Filter
        <SlidersHorizontal aria-hidden className="size-4 text-muted-foreground" />
      </button>

      <div className={cn("flex-col gap-6 px-4 pb-4 md:flex", isOpen ? "flex" : "hidden")}>
        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-2.5 text-sm font-semibold">Jenis tanaman</legend>
          {plantTypes.map((t) => (
            <div key={t.id} className="flex items-center gap-2.5">
              <Checkbox id={`type-${t.id}`} name="type" value={t.id} defaultChecked={selected.includes(t.id)} />
              <Label htmlFor={`type-${t.id}`} className="flex-1 font-normal">
                {t.name}
              </Label>
              <span className="text-xs text-muted-foreground tabular-nums">{t.productCount}</span>
            </div>
          ))}
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-semibold">Kisaran harga (Rp)</legend>
          <div className="flex items-center gap-2">
            <Input
              name="min"
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              placeholder="Min"
              aria-label="Harga minimum"
              defaultValue={min}
            />
            <span aria-hidden className="text-muted-foreground">–</span>
            <Input
              name="max"
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              placeholder="Maks"
              aria-label="Harga maksimum"
              defaultValue={max}
            />
          </div>
        </fieldset>

        <div className="flex flex-col gap-2">
          <Button type="submit" size="lg" className="w-full">
            Terapkan filter
          </Button>
          {hasFilters && (
            <Button asChild variant="ghost" size="lg" className="w-full">
              <Link href="/catalog">Hapus semua filter</Link>
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}

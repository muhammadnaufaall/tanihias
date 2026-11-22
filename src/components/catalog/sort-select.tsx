"use client";

import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { ProductSort } from "@/lib/types";

export function SortSelect({ value }: { value: ProductSort }) {
  return (
    <NativeSelect
      name="sort"
      aria-label="Urutkan produk"
      defaultValue={value}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className="[&_select]:h-10 [&_select]:bg-card"
    >
      <NativeSelectOption value="newest">Terbaru</NativeSelectOption>
      <NativeSelectOption value="price_asc">Harga termurah</NativeSelectOption>
      <NativeSelectOption value="price_desc">Harga termahal</NativeSelectOption>
    </NativeSelect>
  );
}

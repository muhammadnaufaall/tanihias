import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { Search, SearchX } from "lucide-react";
import { FilterPanel } from "@/components/catalog/filter-panel";
import { SortSelect } from "@/components/catalog/sort-select";
import { CardGridSkeleton } from "@/components/loading-skeletons";
import { Pagination } from "@/components/pagination";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { listPlantTypes, searchProducts, type CatalogFilter } from "@/lib/data";
import type { ProductSort } from "@/lib/types";

export const metadata: Metadata = { title: "Katalog" };

export default function CatalogPage({ searchParams }: PageProps<"/catalog">) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Katalog tanaman</h1>
      <p className="mt-1 text-muted-foreground">Semua tanaman di sini dijual langsung oleh petani Cihideung.</p>
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

type CatalogParams = Awaited<PageProps<"/catalog">["searchParams"]>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const nonNegativeNumber = (v: string | string[] | undefined) => {
  const n = Number(first(v));
  return first(v) && Number.isFinite(n) && n >= 0 ? n : undefined;
};

function parseFilter(sp: CatalogParams): CatalogFilter {
  const sort = first(sp.sort);
  return {
    q: first(sp.q) ?? "",
    plantTypes: [sp.type ?? []].flat(),
    min: nonNegativeNumber(sp.min),
    max: nonNegativeNumber(sp.max),
    sort: sort === "price_asc" || sort === "price_desc" ? sort : ("newest" satisfies ProductSort),
    page: Number(first(sp.page)) || 1,
  };
}

function catalogHref(filter: CatalogFilter, page: number) {
  const p = new URLSearchParams();
  if (filter.q) p.set("q", filter.q);
  filter.plantTypes.forEach((t) => p.append("type", t));
  if (filter.min !== undefined) p.set("min", String(filter.min));
  if (filter.max !== undefined) p.set("max", String(filter.max));
  if (filter.sort !== "newest") p.set("sort", filter.sort);
  if (page > 1) p.set("page", String(page));
  const qs = p.toString();
  return qs ? `/catalog?${qs}` : "/catalog";
}

async function CatalogContent({ searchParams }: { searchParams: PageProps<"/catalog">["searchParams"] }) {
  const filter = parseFilter(await searchParams);
  const [result, plantTypes] = await Promise.all([searchProducts(filter), listPlantTypes()]);
  const hasFilters = Boolean(
    filter.q || filter.plantTypes.length || filter.min !== undefined || filter.max !== undefined,
  );

  return (
    <Form action="/catalog" className="mt-8 grid gap-6 md:grid-cols-[15rem_1fr]">
      <FilterPanel
        plantTypes={plantTypes}
        selected={filter.plantTypes}
        min={filter.min}
        max={filter.max}
        hasFilters={hasFilters}
      />

      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-48 flex-1">
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              type="search"
              defaultValue={filter.q}
              placeholder="Cari nama atau jenis tanaman"
              aria-label="Cari tanaman"
              className="h-10 bg-card pl-9"
            />
          </div>
          <Button type="submit" className="h-10 px-5">
            Cari
          </Button>
          <SortSelect value={filter.sort} />
        </div>

        <p className="text-sm text-muted-foreground" aria-live="polite">
          {result.total} tanaman ditemukan
          {filter.q && (
            <>
              {" "}untuk <span className="font-medium text-foreground">&ldquo;{filter.q}&rdquo;</span>
            </>
          )}
        </p>

        {result.products.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-3">
            {result.products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card px-6 py-14 text-center">
            <SearchX aria-hidden className="size-8 text-muted-foreground" />
            <p className="font-semibold">Produk tidak ditemukan</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Belum ada tanaman yang cocok dengan pencarian dan filter ini. Coba kata kunci lain atau longgarkan
              filternya.
            </p>
            <Button asChild variant="outline" size="lg">
              <Link href="/catalog">Hapus semua filter</Link>
            </Button>
          </div>
        )}

        <Pagination page={result.page} totalPages={result.totalPages} href={(n) => catalogHref(filter, n)} />
      </div>
    </Form>
  );
}

function CatalogSkeleton() {
  return (
    <div className="mt-8 grid gap-6 md:grid-cols-[15rem_1fr]">
      <Skeleton className="h-14 rounded-xl md:h-96" />
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-full" />
        <CardGridSkeleton count={6} className="lg:grid-cols-3" />
      </div>
    </div>
  );
}

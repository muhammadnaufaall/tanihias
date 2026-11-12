import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Search } from "lucide-react";
import { CardGridSkeleton } from "@/components/loading-skeletons";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getLatestProducts, listPlantTypes } from "@/lib/data";

// The public home page follows wireframe Figure 3.13 (hero + search,
// plant types, latest products). Wireframe 3.8 is used for the admin dashboard.
export default function HomePage() {
  return (
    <>
      <Hero />

      <section aria-labelledby="plant-types-heading" className="mx-auto w-full max-w-6xl px-4 pt-14">
        <h2 id="plant-types-heading" className="text-2xl font-bold">Jenis tanaman</h2>
        <Suspense fallback={<PlantTypeChipsSkeleton />}>
          <PlantTypeChips />
        </Suspense>
      </section>

      <section aria-labelledby="latest-heading" className="mx-auto w-full max-w-6xl px-4 pt-12 pb-20">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 id="latest-heading" className="text-2xl font-bold">Baru dipanen</h2>
          <Link href="/catalog" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Lihat semua <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
        <Suspense fallback={<CardGridSkeleton count={4} />}>
          <LatestProducts />
        </Suspense>
      </section>
    </>
  );
}

// Plant tags standing in the hero's garden bed. Decorative; prices come from the sample data.
const heroTags = [
  { name: "Krisan", price: "15rb", height: 132, tilt: -4 },
  { name: "Anggrek bulan", price: "85rb", height: 188, tilt: 3 },
  { name: "Monstera", price: "75rb", height: 108, tilt: -2 },
  { name: "Kaktus mini", price: "10rb", height: 156, tilt: 5 },
];

function Hero() {
  return (
    <section className="greenhouse-film relative overflow-hidden border-b">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-[1.15fr_1fr]">
        <div className="py-14 sm:py-20">
          <p className="text-sm font-semibold text-primary">Desa Cihideung, Kabupaten Bandung Barat</p>
          <h1 className="mt-3 text-4xl leading-[1.02] font-extrabold sm:text-5xl lg:text-[3.6rem]">
            Tanaman hias, langsung dari kebun petaninya.
          </h1>
          <p className="mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
            Cari krisan, anggrek, sampai monstera, lalu chat petaninya lewat WhatsApp. Tanpa perantara,
            tanpa potongan komisi.
          </p>
          <Form action="/catalog" className="mt-8 flex max-w-lg gap-2">
            <label htmlFor="home-search" className="sr-only">
              Cari tanaman
            </label>
            <div className="relative flex-1">
              <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="home-search"
                name="q"
                type="search"
                placeholder="Coba: anggrek, krisan, pakis"
                className="h-11 bg-card pl-9 text-base"
              />
            </div>
            <Button type="submit" className="h-11 px-5">
              Cari
            </Button>
          </Form>
        </div>

        {/* Garden bed: plant tags standing in the soil */}
        <div aria-hidden className="relative hidden items-end justify-center gap-5 md:flex lg:gap-8">
          {heroTags.map((tag, i) => (
            <div
              key={tag.name}
              className="animate-grow flex flex-col items-center drop-shadow-[0_4px_4px_rgb(23_33_27/0.2)]"
              style={{ animationDelay: `${120 + i * 110}ms`, rotate: `${tag.tilt}deg` }}
            >
              <div className="flex min-w-28 flex-col items-center rounded-t-sm bg-white px-3 pt-2 pb-2.5 text-center">
                <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                  {tag.name}
                </span>
                <span className="font-tag text-2xl leading-tight text-bloom">{tag.price}</span>
              </div>
              <div className="w-5 bg-white" style={{ height: tag.height }} />
            </div>
          ))}
        </div>
      </div>
      {/* Garden bed soil */}
      <div
        aria-hidden
        className="relative z-10 hidden h-7 bg-foreground md:block"
        style={{
          backgroundImage: "radial-gradient(rgb(255 255 255 / 0.08) 1px, transparent 1.5px)",
          backgroundSize: "9px 9px",
        }}
      />
    </section>
  );
}

async function PlantTypeChips() {
  const plantTypes = await listPlantTypes();
  return (
    <ul className="mt-5 flex flex-wrap gap-2.5">
      {plantTypes.map((t) => (
        <li key={t.id}>
          <Link
            href={`/catalog?type=${t.id}`}
            className="inline-flex h-10 items-center gap-2 rounded-full border bg-card px-4 text-sm font-medium outline-none hover:border-primary hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {t.name}
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground tabular-nums">
              {t.productCount}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function PlantTypeChipsSkeleton() {
  return (
    <div className="mt-5 flex flex-wrap gap-2.5">
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-10 w-32 rounded-full" />
      ))}
    </div>
  );
}

async function LatestProducts() {
  const products = await getLatestProducts(4);
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

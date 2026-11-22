import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ChevronRight, Eye, MapPin, MessageCircle, Pencil } from "lucide-react";
import { CardGridSkeleton } from "@/components/loading-skeletons";
import { PlantTag } from "@/components/plant-tag";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product/product-gallery";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getFarmerBusiness, getOtherBusinessProducts, getProduct } from "@/lib/data";
import { formatPriceRange, formatPriceTag, initials, whatsappLink } from "@/lib/format";
import { requireSession } from "@/lib/session";

export default function ProductPage({ params }: PageProps<"/products/[id]">) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <Suspense fallback={<DetailSkeleton />}>
        <ProductDetail params={params} />
      </Suspense>
    </div>
  );
}

async function ProductDetail({ params }: { params: PageProps<"/products/[id]">["params"] }) {
  const [{ id }, session] = await Promise.all([params, requireSession()]);
  const [product, ownBusiness] = await Promise.all([
    getProduct(id),
    session.role === "farmer" ? getFarmerBusiness(session.id) : null,
  ]);
  if (!product) notFound();

  const { business } = product;
  const isOwner = ownBusiness?.id === product.business_id;
  const whatsappMessage = `Halo ${business.business_name}, saya ${session.name}. Saya lihat "${product.name}" di Tanihias. Apakah masih tersedia?`;

  return (
    <>
      {isOwner && <OwnerPreviewBar productId={product.id} />}

      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link href="/catalog" className="hover:text-foreground">
          Katalog
        </Link>
        <ChevronRight aria-hidden className="size-3.5" />
        <Link href={`/catalog?type=${product.plant_type_id}`} className="hover:text-foreground">
          {product.plantType.name}
        </Link>
        <ChevronRight aria-hidden className="size-3.5" />
        <span aria-current="page" className="text-foreground">
          {product.name}
        </span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        <ProductGallery plantType={product.plantType.name} name={product.name} photos={product.photos} />

        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">{product.name}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline">{product.plantType.name}</Badge>
              {product.is_available ? (
                <Badge className="bg-secondary text-secondary-foreground">Tersedia</Badge>
              ) : (
                <Badge variant="destructive">Stok kosong</Badge>
              )}
            </div>
          </div>

          <div className="flex items-end gap-4">
            <PlantTag size="md" title="Harga" tilt={-3}>
              <span aria-hidden>{formatPriceTag(product.min_price, product.max_price)}</span>
            </PlantTag>
            <div className="pb-6">
              <p className="text-lg font-semibold tabular-nums">
                {formatPriceRange(product.min_price, product.max_price)}
              </p>
              <p className="text-sm text-muted-foreground">Harga akhir disepakati langsung dengan petani.</p>
            </div>
          </div>

          <p className="leading-relaxed text-pretty">{product.description}</p>

          <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
            <Avatar className="size-11">
              <AvatarFallback className="bg-secondary font-semibold">{initials(business.business_name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold">{business.business_name}</p>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin aria-hidden className="size-3.5 shrink-0" />
                {business.location || "Lokasi belum diisi"}
              </p>
            </div>
          </div>

          {business.whatsapp_number ? (
            <Button asChild size="lg" className="h-12 text-base">
              <a href={whatsappLink(business.whatsapp_number, whatsappMessage)} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden className="size-5" />
                Chat petani di WhatsApp
              </a>
            </Button>
          ) : (
            <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              Petani ini belum mencantumkan nomor WhatsApp. Coba lagi nanti.
            </p>
          )}
        </div>
      </div>

      <section aria-labelledby="other-products-heading" className="mt-16">
        <h2 id="other-products-heading" className="mb-5 text-2xl font-bold">
          Produk lain dari {business.business_name}
        </h2>
        <Suspense fallback={<CardGridSkeleton count={4} />}>
          <OtherProducts businessId={business.id} excludeId={product.id} />
        </Suspense>
      </section>
    </>
  );
}

function OwnerPreviewBar({ productId }: { productId: string }) {
  return (
    <aside
      aria-label="Pratinjau penjual"
      className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm"
    >
      <Eye aria-hidden className="size-5 shrink-0 text-primary" />
      <div className="min-w-48 flex-1">
        <p className="font-semibold">Tampilan pembeli</p>
        <p className="text-muted-foreground">Begini produkmu terlihat oleh pembeli. Hanya kamu yang melihat kotak ini.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="ghost">
          <Link href="/farmer">
            <ArrowLeft aria-hidden />
            Produk saya
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/farmer/products/${productId}/edit`}>
            <Pencil aria-hidden />
            Ubah produk
          </Link>
        </Button>
      </div>
    </aside>
  );
}

async function OtherProducts({ businessId, excludeId }: { businessId: string; excludeId: string }) {
  const products = await getOtherBusinessProducts(businessId, excludeId, 4);
  if (products.length === 0) {
    return <p className="text-muted-foreground">Petani ini belum punya produk lain.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid gap-8 pt-11 md:grid-cols-2 lg:gap-12">
      <Skeleton className="aspect-[4/3] rounded-xl" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

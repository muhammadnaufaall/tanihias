import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ShieldX } from "lucide-react";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { ProductForm } from "@/components/farmer/product-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getBusinessProduct, getFarmerBusiness, listPlantTypes } from "@/lib/data";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Ubah produk" };

export default function EditProductPage({ params }: PageProps<"/farmer/products/[id]/edit">) {
  return (
    <>
      <PageHeader title="Ubah produk" />
      <Suspense fallback={<Skeleton className="h-[34rem] rounded-xl" />}>
        <EditProductForm params={params} />
      </Suspense>
    </>
  );
}

async function EditProductForm({ params }: { params: PageProps<"/farmer/products/[id]/edit">["params"] }) {
  const [{ id }, session] = await Promise.all([params, requireSession("farmer")]);
  const business = await getFarmerBusiness(session.id);
  const [product, plantTypes] = await Promise.all([
    business ? getBusinessProduct(business.id, id) : null,
    listPlantTypes(),
  ]);

  if (!product) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card px-6 py-16 text-center">
        <ShieldX aria-hidden className="size-8 text-destructive" />
        <p className="font-semibold">Akses ditolak</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Produk ini tidak ada atau bukan milik usaha kamu, jadi tidak bisa diubah.
        </p>
        <Button asChild variant="outline" size="lg">
          <Link href="/farmer">Kembali ke produk saya</Link>
        </Button>
      </div>
    );
  }

  return <ProductForm plantTypes={plantTypes} product={product} />;
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { ProductForm } from "@/components/farmer/product-form";
import { Skeleton } from "@/components/ui/skeleton";
import { listPlantTypes } from "@/lib/data";

export const metadata: Metadata = { title: "Tambah produk" };

// Wireframe Figure 3.12
export default function NewProductPage() {
  return (
    <>
      <PageHeader title="Tambah produk" description="Produk yang disimpan langsung tampil di katalog." />
      <Suspense fallback={<Skeleton className="h-[34rem] rounded-xl" />}>
        <NewProductForm />
      </Suspense>
    </>
  );
}

async function NewProductForm() {
  const plantTypes = await listPlantTypes();
  return <ProductForm plantTypes={plantTypes} />;
}

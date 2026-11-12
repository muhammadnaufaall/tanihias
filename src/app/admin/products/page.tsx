import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ExternalLink } from "lucide-react";
import { takeDownProduct } from "@/actions/admin";
import { ActionButton } from "@/components/dashboard/action-button";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { TableSkeleton } from "@/components/loading-skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAllProducts } from "@/lib/data";
import { formatPriceRange } from "@/lib/format";

export const metadata: Metadata = { title: "Monitoring produk" };

export default function ProductMonitoringPage() {
  return (
    <>
      <PageHeader
        title="Monitoring produk"
        description="Turunkan produk yang melanggar aturan, misalnya bukan tanaman hias atau informasinya menyesatkan."
      />
      <Suspense fallback={<TableSkeleton rows={8} />}>
        <ProductsTable />
      </Suspense>
    </>
  );
}

async function ProductsTable() {
  const products = await listAllProducts();
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Produk</TableHead>
            <TableHead>Petani</TableHead>
            <TableHead>Jenis</TableHead>
            <TableHead>Harga</TableHead>
            <TableHead>Stok</TableHead>
            <TableHead className="pr-4 text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="pl-4 font-medium">{p.name}</TableCell>
              <TableCell>{p.business.business_name || "—"}</TableCell>
              <TableCell>{p.plantType.name}</TableCell>
              <TableCell className="tabular-nums">{formatPriceRange(p.min_price, p.max_price)}</TableCell>
              <TableCell>
                {p.is_available ? (
                  <Badge className="bg-secondary text-secondary-foreground">Tersedia</Badge>
                ) : (
                  <Badge variant="outline">Kosong</Badge>
                )}
              </TableCell>
              <TableCell className="pr-4">
                <div className="flex justify-end gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/products/${p.id}`}>
                      <ExternalLink aria-hidden />
                      Lihat
                    </Link>
                  </Button>
                  <ActionButton
                    variant="destructive"
                    action={takeDownProduct.bind(null, p.id)}
                    confirm={{
                      title: `Turunkan ${p.name}?`,
                      description: "Produk dihapus dari katalog. Petani perlu menambahkannya lagi jika ingin memajangnya.",
                      confirmLabel: "Turunkan produk",
                    }}
                  >
                    Turunkan
                  </ActionButton>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

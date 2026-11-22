import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { TableSkeleton } from "@/components/loading-skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAdminStats, listAllProducts } from "@/lib/data";
import { formatDate, formatPriceRange } from "@/lib/format";

export const metadata: Metadata = { title: "Dasbor admin" };

export default function AdminOverviewPage() {
  return (
    <>
      <PageHeader title="Ringkasan" description="Kondisi terkini marketplace Tanihias." />
      <Suspense fallback={<StatCardsSkeleton />}>
        <StatCards />
      </Suspense>
      <div className="mt-8 mb-4 flex items-end justify-between">
        <h2 className="text-xl font-bold">Produk terbaru</h2>
        <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          Monitoring produk <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <LatestProductsTable />
      </Suspense>
    </>
  );
}

async function StatCards() {
  const stats = await getAdminStats();
  const cards = [
    { label: "Petani terdaftar", value: stats.farmers, href: "/admin/users" },
    { label: "Pembeli terdaftar", value: stats.buyers, href: "/admin/users" },
    { label: "Produk tayang", value: stats.products, href: "/admin/products" },
    { label: "Jenis tanaman", value: stats.plantTypes, href: "/admin/plant-types" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <Link
          key={card.label}
          href={card.href}
          className="rounded-xl border bg-card p-4 outline-none hover:border-primary focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="block text-sm text-muted-foreground">{card.label}</span>
          <span className="mt-1 block font-heading text-3xl font-bold tabular-nums">{card.value}</span>
        </Link>
      ))}
    </div>
  );
}

function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}

async function LatestProductsTable() {
  const products = (await listAllProducts()).slice(0, 6);
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Produk</TableHead>
            <TableHead>Petani</TableHead>
            <TableHead>Jenis</TableHead>
            <TableHead>Harga</TableHead>
            <TableHead className="pr-4">Ditambahkan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="pl-4 font-medium">{p.name}</TableCell>
              <TableCell>{p.business.business_name}</TableCell>
              <TableCell>{p.plantType.name}</TableCell>
              <TableCell className="tabular-nums">{formatPriceRange(p.min_price, p.max_price)}</TableCell>
              <TableCell className="pr-4">{formatDate(p.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CircleAlert, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteMyProduct } from "@/actions/farmer";
import { ActionButton } from "@/components/dashboard/action-button";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { FlashToast } from "@/components/dashboard/flash-toast";
import { TableSkeleton } from "@/components/loading-skeletons";
import { Pagination } from "@/components/pagination";
import { PlantImage } from "@/components/plant-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getFarmerBusiness, isValidUuid, listBusinessProducts } from "@/lib/data";
import { formatDate, formatPriceRange } from "@/lib/format";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Produk saya" };

const PER_PAGE = 10;

const statusMessages: Record<string, string> = {
  added: "Produk ditambahkan dan sudah tampil di katalog.",
  updated: "Perubahan produk disimpan.",
};

// Wireframe Figure 3.11
export default function MyProductsPage({ searchParams }: PageProps<"/farmer">) {
  return (
    <>
      <PageHeader
        title="Produk saya"
        description="Tanaman yang kamu pajang di katalog Tanihias."
        action={
          <Button asChild size="lg">
            <Link href="/farmer/products/new">
              <Plus aria-hidden />
              Tambah produk
            </Link>
          </Button>
        }
      />
      <Suspense fallback={<TableSkeleton />}>
        <MyProductList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function MyProductList({ searchParams }: { searchParams: PageProps<"/farmer">["searchParams"] }) {
  const [session, sp] = await Promise.all([requireSession("farmer"), searchParams]);
  const business = await getFarmerBusiness(session.id);
  const products = business ? await listBusinessProducts(business.id) : [];

  const statusMessage = typeof sp.status === "string" ? statusMessages[sp.status] : undefined;
  const savedProductId = typeof sp.product === "string" && isValidUuid(sp.product) ? sp.product : undefined;
  const totalPages = Math.max(1, Math.ceil(products.length / PER_PAGE));
  const page = Math.min(Math.max(1, Number(sp.page) || 1), totalPages);
  const visible = products.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="flex flex-col gap-5">
      {statusMessage && (
        <FlashToast
          message={statusMessage}
          action={savedProductId ? { label: "Lihat", href: `/products/${savedProductId}` } : undefined}
        />
      )}

      {business && !business.whatsapp_number && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-bloom/30 bg-bloom/5 p-4 text-sm">
          <CircleAlert aria-hidden className="size-5 shrink-0 text-bloom" />
          <p className="flex-1">
            Profil usaha belum lengkap. Pembeli belum bisa menghubungi kamu sebelum nomor WhatsApp diisi.
          </p>
          <Button asChild variant="outline">
            <Link href="/farmer/profile">Lengkapi profil usaha</Link>
          </Button>
        </div>
      )}

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card px-6 py-16 text-center">
          <p className="font-semibold">Belum ada produk</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Tambahkan tanaman pertamamu. Produk langsung tampil di katalog dan bisa dicari pembeli.
          </p>
          <Button asChild size="lg">
            <Link href="/farmer/products/new">
              <Plus aria-hidden />
              Tambah produk
            </Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 pl-4">
                  <span className="sr-only">Foto</span>
                </TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-4 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="pl-4">
                    <PlantImage
                      plantType={p.plantType.name}
                      name={p.name}
                      photo={p.photos[0]?.url}
                      sizes="48px"
                      iconSize="size-6"
                      className="size-12 rounded-md"
                    />
                  </TableCell>
                  <TableCell>
                    <span className="block font-medium">{p.name}</span>
                    <span className="text-xs text-muted-foreground">Ditambahkan {formatDate(p.created_at)}</span>
                  </TableCell>
                  <TableCell>{p.plantType.name}</TableCell>
                  <TableCell className="tabular-nums">{formatPriceRange(p.min_price, p.max_price)}</TableCell>
                  <TableCell>
                    {p.is_available ? (
                      <Badge className="bg-secondary text-secondary-foreground">Tersedia</Badge>
                    ) : (
                      <Badge variant="outline">Stok kosong</Badge>
                    )}
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/products/${p.id}`} aria-label={`Lihat ${p.name} seperti pembeli`}>
                          <Eye aria-hidden />
                          Lihat
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/farmer/products/${p.id}/edit`}>
                          <Pencil aria-hidden />
                          Ubah
                        </Link>
                      </Button>
                      <ActionButton
                        variant="destructive"
                        action={deleteMyProduct.bind(null, p.id)}
                        confirm={{
                          title: `Hapus ${p.name}?`,
                          description: "Produk ini akan hilang dari katalog dan tidak bisa dikembalikan.",
                          confirmLabel: "Hapus produk",
                        }}
                      >
                        <Trash2 aria-hidden />
                        Hapus
                      </ActionButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} href={(n) => (n > 1 ? `/farmer?page=${n}` : "/farmer")} />
    </div>
  );
}

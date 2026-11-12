import type { Metadata } from "next";
import { Suspense } from "react";
import { deletePlantType } from "@/actions/admin";
import { PlantTypeForm } from "@/components/admin/plant-type-form";
import { ActionButton } from "@/components/dashboard/action-button";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { TableSkeleton } from "@/components/loading-skeletons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listPlantTypesForAdmin } from "@/lib/data";

export const metadata: Metadata = { title: "Jenis tanaman" };

export default function PlantTypesPage() {
  return (
    <>
      <PageHeader title="Jenis tanaman" description="Kategori yang dipilih petani saat menambah produk dan dipakai pembeli untuk menyaring katalog." />
      <div className="flex flex-col gap-5">
        <PlantTypeForm />
        <Suspense fallback={<TableSkeleton rows={6} />}>
          <PlantTypesTable />
        </Suspense>
      </div>
    </>
  );
}

async function PlantTypesTable() {
  const plantTypes = await listPlantTypesForAdmin();
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Nama jenis</TableHead>
            <TableHead>Jumlah produk</TableHead>
            <TableHead className="pr-4 text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plantTypes.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="pl-4 font-medium">{t.name}</TableCell>
              <TableCell className="tabular-nums">{t.productCount}</TableCell>
              <TableCell className="pr-4">
                <div className="flex items-center justify-end gap-3">
                  {t.productCount > 0 && (
                    <span className="hidden text-xs text-muted-foreground sm:inline">Masih dipakai produk</span>
                  )}
                  <ActionButton
                    variant="destructive"
                    disabled={t.productCount > 0}
                    action={deletePlantType.bind(null, t.id)}
                    confirm={{
                      title: `Hapus jenis "${t.name}"?`,
                      description: "Jenis ini tidak akan muncul lagi di filter katalog dan form produk.",
                      confirmLabel: "Hapus jenis",
                    }}
                  >
                    Hapus
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

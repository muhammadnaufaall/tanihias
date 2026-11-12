import type { Metadata } from "next";
import { Suspense } from "react";
import { deleteAccount, setBlocked } from "@/actions/admin";
import { ActionButton } from "@/components/dashboard/action-button";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { TableSkeleton } from "@/components/loading-skeletons";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listUsers } from "@/lib/data";
import { ROLE_LABELS, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Kelola pengguna" };

export default function UsersPage() {
  return (
    <>
      <PageHeader
        title="Pengguna"
        description="Blokir akun yang melanggar aturan. Produk dari petani yang diblokir otomatis disembunyikan dari katalog."
      />
      <Suspense fallback={<TableSkeleton rows={8} />}>
        <UsersTable />
      </Suspense>
    </>
  );
}

async function UsersTable() {
  const users = await listUsers();
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Nama</TableHead>
            <TableHead>Peran</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Bergabung</TableHead>
            <TableHead className="pr-4 text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="pl-4">
                <span className="block font-medium">{u.name}</span>
                <span className="text-xs text-muted-foreground">{u.email}</span>
              </TableCell>
              <TableCell>{ROLE_LABELS[u.role]}</TableCell>
              <TableCell>
                {u.status === "active" ? (
                  <Badge className="bg-secondary text-secondary-foreground">Aktif</Badge>
                ) : (
                  <Badge variant="destructive">Diblokir</Badge>
                )}
              </TableCell>
              <TableCell>{formatDate(u.created_at)}</TableCell>
              <TableCell className="pr-4">
                {u.role === "admin" ? (
                  <span className="block text-right text-xs text-muted-foreground">Tidak bisa diubah</span>
                ) : (
                  <div className="flex justify-end gap-2">
                    {u.status === "active" ? (
                      <ActionButton
                        action={setBlocked.bind(null, u.id, true)}
                        confirm={{
                          title: `Blokir ${u.name}?`,
                          description:
                            u.role === "farmer"
                              ? "Petani ini tidak bisa masuk dan semua produknya disembunyikan dari katalog sampai blokir dibuka."
                              : "Pembeli ini tidak bisa masuk sampai blokir dibuka.",
                          confirmLabel: "Blokir akun",
                        }}
                      >
                        Blokir
                      </ActionButton>
                    ) : (
                      <ActionButton action={setBlocked.bind(null, u.id, false)}>Buka blokir</ActionButton>
                    )}
                    <ActionButton
                      variant="destructive"
                      action={deleteAccount.bind(null, u.id)}
                      confirm={{
                        title: `Hapus akun ${u.name}?`,
                        description:
                          u.role === "farmer"
                            ? "Akun, profil usaha, dan semua produk petani ini dihapus permanen."
                            : "Akun ini dihapus permanen.",
                        confirmLabel: "Hapus akun",
                      }}
                    >
                      Hapus
                    </ActionButton>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

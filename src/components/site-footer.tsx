import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <Logo className="text-base" />
          <p>Tanaman hias langsung dari petani Desa Cihideung, Kabupaten Bandung Barat.</p>
        </div>
        <p className="text-xs">Capstone Project STSI4440 · Kelompok C · Universitas Terbuka</p>
      </div>
    </footer>
  );
}

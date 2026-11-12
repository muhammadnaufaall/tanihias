import Link from "next/link";
import { Logo } from "@/components/logo";
import { PlantTag } from "@/components/plant-tag";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="greenhouse-film flex flex-1 flex-col items-center justify-center gap-6 px-4 py-20 text-center">
      <Logo />
      <PlantTag size="lg" title="Halaman" tilt={-4}>
        tidak ada
      </PlantTag>
      <div>
        <h1 className="text-2xl font-bold">Halaman tidak ditemukan</h1>
        <p className="mt-1 text-muted-foreground">Tautannya mungkin salah, atau produknya sudah tidak dijual.</p>
      </div>
      <Button asChild size="lg">
        <Link href="/catalog">Kembali ke katalog</Link>
      </Button>
    </div>
  );
}

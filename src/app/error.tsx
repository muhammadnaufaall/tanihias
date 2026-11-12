"use client";

import Link from "next/link";
import { useEffect } from "react";
import { PlantTag } from "@/components/plant-tag";
import { Button } from "@/components/ui/button";

// Shown when data fails to load, e.g. Supabase is not configured in
// .env.local or cannot be reached.
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="greenhouse-film flex flex-1 flex-col items-center justify-center gap-6 px-4 py-20 text-center">
      <PlantTag size="lg" title="Data" tilt={3}>
        belum layu
      </PlantTag>
      <div>
        <h1 className="text-2xl font-bold">Data belum bisa dimuat</h1>
        <p className="mt-1 max-w-md text-muted-foreground">
          Koneksi ke server sedang bermasalah. Coba lagi beberapa saat lagi.
        </p>
      </div>
      <div className="flex gap-2">
        <Button size="lg" onClick={() => retry()}>
          Coba lagi
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/">Ke beranda</Link>
        </Button>
      </div>
    </div>
  );
}

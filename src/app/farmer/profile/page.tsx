import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { BusinessProfileForm } from "@/components/farmer/business-profile-form";
import { Skeleton } from "@/components/ui/skeleton";
import { getFarmerBusiness } from "@/lib/data";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Profil usaha" };

export default function BusinessProfilePage() {
  return (
    <>
      <PageHeader
        title="Profil usaha"
        description="Nama usaha dan lokasi tampil di setiap produkmu. Nomor WhatsApp dipakai pembeli untuk menghubungi kamu."
      />
      <Suspense fallback={<Skeleton className="h-96 max-w-xl rounded-xl" />}>
        <BusinessProfileContent />
      </Suspense>
    </>
  );
}

async function BusinessProfileContent() {
  const session = await requireSession("farmer");
  const business = await getFarmerBusiness(session.id);
  if (!business) return <p className="text-muted-foreground">Profil usaha tidak ditemukan.</p>;
  return <BusinessProfileForm business={business} />;
}

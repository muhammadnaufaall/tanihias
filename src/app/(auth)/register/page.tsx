import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";
import { Skeleton } from "@/components/ui/skeleton";
import { safeRedirectPath } from "@/lib/routes";

export const metadata: Metadata = { title: "Daftar" };

export default function RegisterPage({ searchParams }: PageProps<"/register">) {
  return (
    <Suspense fallback={<Skeleton className="h-[38rem] w-full max-w-md rounded-2xl" />}>
      <RegisterContent searchParams={searchParams} />
    </Suspense>
  );
}

async function RegisterContent({ searchParams }: { searchParams: PageProps<"/register">["searchParams"] }) {
  const { next } = await searchParams;
  const redirectPath = safeRedirectPath(Array.isArray(next) ? next[0] : next);

  return (
    <AuthCard active="register" next={redirectPath}>
      <h1 className="text-2xl font-bold">Buat akun Tanihias</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Pembeli bisa melihat detail tanaman dan chat petani. Petani bisa memajang tanaman dari kebunnya.
      </p>
      <RegisterForm next={redirectPath} />
    </AuthCard>
  );
}

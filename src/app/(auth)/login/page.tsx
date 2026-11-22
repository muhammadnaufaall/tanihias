import type { Metadata } from "next";
import { Suspense } from "react";
import { Lock } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { Skeleton } from "@/components/ui/skeleton";
import { safeRedirectPath } from "@/lib/routes";

export const metadata: Metadata = { title: "Masuk" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Suspense fallback={<FormSkeleton />}>
        <LoginContent searchParams={searchParams} />
      </Suspense>
      {process.env.NODE_ENV === "development" && <SampleAccounts />}
    </div>
  );
}

async function LoginContent({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const { next } = await searchParams;
  const redirectPath = safeRedirectPath(Array.isArray(next) ? next[0] : next);

  return (
    <AuthCard active="login" next={redirectPath}>
      <h1 className="text-2xl font-bold">Selamat datang kembali</h1>
      {redirectPath?.startsWith("/products/") ? (
        <p className="mt-2 mb-6 flex gap-2 rounded-lg bg-secondary p-3 text-sm">
          <Lock aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
          Masuk dulu untuk melihat detail produk dan chat petaninya. Belum punya akun? Daftar gratis lewat tab di atas.
        </p>
      ) : (
        <p className="mt-1 mb-6 text-sm text-muted-foreground">Masuk untuk melihat detail tanaman dan menghubungi petani.</p>
      )}
      <LoginForm next={redirectPath} />
    </AuthCard>
  );
}

function SampleAccounts() {
  const accounts = [
    ["Pembeli", "pembeli@tanihias.id"],
    ["Petani", "ujang@tanihias.id"],
    ["Admin", "admin@tanihias.id"],
  ];
  return (
    <div className="rounded-xl border border-dashed bg-card/70 p-4 text-sm">
      <p className="font-semibold">Akun contoh (seed, hanya tampil saat pnpm dev)</p>
      <p className="mt-0.5 text-muted-foreground">
        Kata sandi semua akun: <code className="font-mono text-foreground">tanihias123</code>
      </p>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        {accounts.map(([role, email]) => (
          <div key={email} className="contents">
            <dt className="text-muted-foreground">{role}</dt>
            <dd className="font-mono">{email}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-8">
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-11 w-full" />
    </div>
  );
}

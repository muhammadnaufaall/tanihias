import Link from "next/link";
import { Suspense } from "react";
import { AccountMenu } from "@/components/account-menu";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "@/lib/session";

// Wireframe Figure 3.13: logo, two navigation links, Masuk and Daftar buttons
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/75">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Logo />
        <nav aria-label="Navigasi utama" className="flex items-center gap-5 text-sm font-medium">
          <Link href="/" className="hidden text-muted-foreground hover:text-foreground sm:inline">
            Beranda
          </Link>
          <Link href="/catalog" className="text-muted-foreground hover:text-foreground">
            Katalog
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Suspense fallback={<Skeleton className="h-9 w-36" />}>
            <HeaderAccount />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

async function HeaderAccount() {
  const session = await getSession();
  if (session) return <AccountMenu session={session} />;

  return (
    <>
      <Button asChild variant="outline" size="lg">
        <Link href="/login">Masuk</Link>
      </Button>
      <Button asChild size="lg" className="hidden sm:inline-flex">
        <Link href="/register">Daftar</Link>
      </Button>
    </>
  );
}

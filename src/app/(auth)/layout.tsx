import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="greenhouse-film flex min-h-full flex-1 flex-col">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Logo />
        <Link href="/catalog" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Lihat katalog
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pt-6 pb-16 sm:pt-12">{children}</main>
    </div>
  );
}

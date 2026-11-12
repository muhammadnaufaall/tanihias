import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AuthTab = "login" | "register";

// Wireframe Figure 3.7: centered card with Masuk / Daftar tabs above the form
export function AuthCard({
  active,
  next,
  children,
}: {
  active: AuthTab;
  next?: string | null;
  children: ReactNode;
}) {
  const qs = next ? `?next=${encodeURIComponent(next)}` : "";
  const tab = (id: AuthTab, label: string) => (
    <Link
      href={`/${id}${qs}`}
      aria-current={active === id ? "page" : undefined}
      className={cn(
        "flex h-9 flex-1 items-center justify-center rounded-md text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        active === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );

  return (
    <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-[0_12px_40px_-20px_rgb(23_33_27/0.35)] sm:p-8">
      <nav aria-label="Masuk atau daftar" className="mb-6 flex gap-1 rounded-lg bg-muted p-1">
        {tab("login", "Masuk")}
        {tab("register", "Daftar")}
      </nav>
      {children}
    </div>
  );
}

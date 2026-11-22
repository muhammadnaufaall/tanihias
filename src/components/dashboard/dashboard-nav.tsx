"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, type LucideIcon, Package, Plus, Store, Tags, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export type DashboardRole = "farmer" | "admin";

type MenuItem = { href: string; label: string; icon: LucideIcon; prefixes?: string[] };

const menu: Record<DashboardRole, MenuItem[]> = {
  farmer: [
    { href: "/farmer", label: "Produk saya", icon: Package, prefixes: ["/farmer/products/"] },
    { href: "/farmer/products/new", label: "Tambah produk", icon: Plus },
    { href: "/farmer/profile", label: "Profil usaha", icon: Store },
  ],
  admin: [
    { href: "/admin", label: "Ringkasan", icon: LayoutDashboard },
    { href: "/admin/users", label: "Pengguna", icon: Users },
    { href: "/admin/plant-types", label: "Jenis tanaman", icon: Tags },
    { href: "/admin/products", label: "Monitoring produk", icon: Package },
  ],
};

function activeItem(items: MenuItem[], pathname: string | null) {
  if (!pathname) return null;
  let best: { href: string; length: number } | null = null;
  for (const item of items) {
    for (const p of [item.href, ...(item.prefixes ?? [])]) {
      const matches = pathname === p || pathname.startsWith(p.endsWith("/") ? p : `${p}/`);
      if (matches && (!best || p.length > best.length)) best = { href: item.href, length: p.length };
    }
  }
  return best?.href ?? null;
}

export function DashboardNav({ role }: { role: DashboardRole }) {
  const pathname = usePathname();
  return <DashboardMenu role={role} active={activeItem(menu[role], pathname)} />;
}

export function DashboardMenu({ role, active = null }: { role: DashboardRole; active?: string | null }) {
  return (
    <nav aria-label="Menu dasbor" className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {menu[role].map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={active === item.href ? "page" : undefined}
          className={cn(
            "flex h-10 shrink-0 items-center gap-2.5 rounded-lg px-3 text-sm font-medium whitespace-nowrap outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            active === item.href
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <item.icon aria-hidden className="size-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

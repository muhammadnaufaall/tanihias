import type { ReactNode } from "react";
import { Suspense } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/actions/auth";
import { DashboardMenu, DashboardNav, type DashboardRole } from "@/components/dashboard/dashboard-nav";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLE_LABELS } from "@/lib/format";
import { getSession } from "@/lib/session";

// Wireframe Figures 3.11 / 3.12 / 3.8: top bar, side menu, main content
export function DashboardShell({ role, children }: { role: DashboardRole; children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b bg-card">
        <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
          <Logo />
          <Badge variant="outline">{ROLE_LABELS[role]}</Badge>
          <div className="ml-auto flex items-center gap-3">
            <Suspense fallback={<Skeleton className="h-4 w-28" />}>
              <UserName />
            </Suspense>
            <form action={logout}>
              <Button type="submit" variant="outline" size="lg">
                <LogOut aria-hidden />
                Keluar
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col md:flex-row">
        <aside className="border-b bg-card p-3 md:w-60 md:shrink-0 md:border-r md:border-b-0 md:p-4">
          <Suspense fallback={<DashboardMenu role={role} />}>
            <DashboardNav role={role} />
          </Suspense>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

async function UserName() {
  const session = await getSession();
  return <span className="hidden text-sm text-muted-foreground sm:inline">{session?.name}</span>;
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

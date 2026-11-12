"use client";

import Link from "next/link";
import { useTransition } from "react";
import { LayoutDashboard, LogOut } from "lucide-react";
import { logout } from "@/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initials } from "@/lib/format";
import type { Session } from "@/lib/types";

const dashboardLinks = {
  farmer: { href: "/farmer", label: "Dasbor petani" },
  admin: { href: "/admin", label: "Dasbor admin" },
  buyer: null,
};

export function AccountMenu({ session }: { session: Session }) {
  const [isLoggingOut, startLogout] = useTransition();
  const dashboard = dashboardLinks[session.role];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 pr-3 pl-1.5">
          <Avatar className="size-7">
            <AvatarFallback className="bg-secondary text-xs font-semibold">{initials(session.name)}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-32 truncate sm:inline">{session.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <span className="block font-medium">{session.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{session.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {dashboard && (
          <DropdownMenuItem asChild>
            <Link href={dashboard.href}>
              <LayoutDashboard aria-hidden />
              {dashboard.label}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem disabled={isLoggingOut} onSelect={() => startLogout(() => logout())}>
          <LogOut aria-hidden />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

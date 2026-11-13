"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

// Shows a toast once from the ?status=... parameter after a redirect, then
// cleans the URL so the toast does not show again when the page is reloaded.
// `action.href` must be an internal path built on the server.
export function FlashToast({ message, action }: { message: string; action?: { label: string; href: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;
    shown.current = true;
    toast.success(message, action && { action: { label: action.label, onClick: () => router.push(action.href) } });
    router.replace(pathname, { scroll: false });
  }, [message, action, pathname, router]);

  return null;
}

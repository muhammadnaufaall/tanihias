"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

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

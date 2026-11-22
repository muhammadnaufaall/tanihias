"use client";

import type { ReactNode } from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/types";

type Props = {
  action: () => Promise<ActionResult>;
  children: ReactNode;
  variant?: "outline" | "destructive" | "ghost";
  disabled?: boolean;
  confirm?: { title: string; description: string; confirmLabel: string };
};

export function ActionButton({ action, children, variant = "outline", disabled, confirm }: Props) {
  const [isPending, startTransition] = useTransition();

  const run = () =>
    startTransition(async () => {
      const result = await action();
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
    });

  const button = (
    <Button variant={variant} size="sm" disabled={disabled || isPending} onClick={confirm ? undefined : run}>
      {children}
    </Button>
  );

  if (!confirm) return button;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{button}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirm.title}</AlertDialogTitle>
          <AlertDialogDescription>{confirm.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={run}>
            {confirm.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

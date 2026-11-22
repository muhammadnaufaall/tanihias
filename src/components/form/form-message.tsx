import { CircleAlert, CircleCheck } from "lucide-react";

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
      <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
      {message}
    </div>
  );
}

export function FormSuccess({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div role="status" className="flex gap-2 rounded-lg border border-primary/30 bg-secondary p-3 text-sm">
      <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
      {message}
    </div>
  );
}

export function toFieldErrors(messages?: string[]) {
  return messages?.map((message) => ({ message }));
}

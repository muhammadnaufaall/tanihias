import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  totalPages: number;
  // Created in a Server Component, never sent to the client
  href: (page: number) => string;
};

export function Pagination({ page, totalPages, href }: Props) {
  if (totalPages <= 1) return null;

  const itemClass =
    "inline-flex size-9 items-center justify-center rounded-lg border text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

  return (
    <nav aria-label="Halaman" className="flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link href={href(page - 1)} className={cn(itemClass, "bg-card hover:bg-muted")} aria-label="Halaman sebelumnya">
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className={cn(itemClass, "opacity-40")} aria-hidden>
          <ChevronLeft className="size-4" />
        </span>
      )}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={href(n)}
          aria-current={n === page ? "page" : undefined}
          className={cn(
            itemClass,
            n === page ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted",
          )}
        >
          {n}
        </Link>
      ))}
      {page < totalPages ? (
        <Link href={href(page + 1)} className={cn(itemClass, "bg-card hover:bg-muted")} aria-label="Halaman berikutnya">
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className={cn(itemClass, "opacity-40")} aria-hidden>
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}

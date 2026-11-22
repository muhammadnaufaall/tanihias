import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg";
  tilt?: number;
  className?: string;
  style?: CSSProperties;
};

const sizeClasses = {
  sm: { tag: "min-w-20 px-2.5 pt-1.5 pb-5", content: "text-base" },
  md: { tag: "min-w-28 px-3 pt-2 pb-6", content: "text-xl" },
  lg: { tag: "min-w-36 px-4 pt-2.5 pb-8", content: "text-3xl" },
};

export function PlantTag({ children, title, size = "sm", tilt = 0, className, style }: Props) {
  const classes = sizeClasses[size];
  return (
    <div
      className={cn("drop-shadow-[0_3px_3px_rgb(23_33_27/0.22)]", className)}
      style={{ ...style, rotate: `${tilt}deg` }}
    >
      <div className={cn("plant-tag flex flex-col items-center bg-white text-center", classes.tag)}>
        {title && (
          <span className="max-w-32 truncate text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
            {title}
          </span>
        )}
        <span className={cn("font-tag leading-tight whitespace-nowrap text-bloom", classes.content)}>
          {children}
        </span>
      </div>
    </div>
  );
}

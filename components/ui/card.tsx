import * as React from "react";

import { cn } from "@/lib/utils";

/** Fonte única de fundo, borda e raio de card. Ver ADR 0002. */
export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-md border border-line bg-surface-raised shadow-card",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center gap-3 border-b border-line px-4 py-3", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("font-display text-[0.9375rem] font-semibold", className)} {...props} />;
}

export function CardBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-4", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 border-t border-line bg-surface-sunken px-4 py-3",
        className,
      )}
      {...props}
    />
  );
}

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * As variantes de estado usam o token `-strong`, que é a versão com contraste
 * suficiente para texto. Usar o token de preenchimento aqui produz o clássico
 * verde ilegível sobre fundo claro. Ver ADR 0002.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-display text-[0.6875rem] font-semibold tracking-wide",
  {
    variants: {
      variant: {
        neutral: "border border-line bg-surface-sunken text-ink-muted",
        brand: "bg-brand-soft text-brand-ink",
        positive: "bg-positive-soft text-positive-strong",
        negative: "bg-negative-soft text-negative-strong",
        warning: "bg-warning-soft text-warning-strong",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

type BadgeProps = React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

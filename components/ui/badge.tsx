import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * As variantes de estado usam o token `-strong`, que é a versão com contraste
 * suficiente para texto. Usar o token de preenchimento aqui produz o clássico
 * verde ilegível sobre fundo claro. Ver ADR 0002.
 *
 * O ponto à esquerda (`ponto`) marca situação: ativo, pendente, expirado.
 * Sem ponto, a etiqueta é só classificação: área, atividade, papel.
 */
const badgeVariants = cva(
  "inline-flex h-6 max-w-full items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold whitespace-nowrap [&>[data-ponto]]:size-1.5 [&>[data-ponto]]:shrink-0 [&>[data-ponto]]:rounded-full",
  {
    variants: {
      variant: {
        neutral: "bg-surface-sunken text-ink-muted [&>[data-ponto]]:bg-ink-subtle",
        brand: "bg-brand-soft text-brand-ink [&>[data-ponto]]:bg-brand",
        positive: "bg-positive-soft text-positive-strong [&>[data-ponto]]:bg-positive",
        negative: "bg-negative-soft text-negative-strong [&>[data-ponto]]:bg-negative",
        warning: "bg-warning-soft text-warning-strong [&>[data-ponto]]:bg-warning",
        outline: "border border-line text-ink-muted [&>[data-ponto]]:bg-ink-subtle",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { ponto?: boolean };

export function Badge({ className, variant, ponto, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props}>
      {ponto ? <span data-ponto aria-hidden /> : null}
      <span className="truncate">{children}</span>
    </span>
  );
}

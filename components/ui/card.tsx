import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Painel: a única fonte de fundo, borda e raio de bloco de conteúdo.
 * Um painel nunca fica dentro de outro painel. Lista, tabela e formulário
 * moram dentro dele encostados na borda (`CardBody` só quando há texto solto).
 */
export function Card({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border border-line bg-surface-raised shadow-card",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      className={cn("flex min-h-13 items-center gap-3 px-5 pt-4 pb-3", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("text-md font-semibold tracking-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-sm text-ink-muted", className)} {...props} />;
}

/** Título e descrição empilhados, para o cabeçalho de um painel. */
export function CardHeading({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex min-w-0 flex-1 flex-col gap-0.5", className)} {...props} />;
}

export function CardBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-5 pb-5 [header+&]:pt-0 [&:first-child]:pt-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.ComponentProps<"footer">) {
  return (
    <footer
      className={cn(
        "flex items-center justify-end gap-2 border-t border-line bg-surface px-5 py-3.5",
        className,
      )}
      {...props}
    />
  );
}

/** Nota de rodapé discreta dentro de um painel, para explicar uma regra. */
export function CardNota({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("border-t border-line px-5 py-3 text-xs leading-relaxed text-ink-muted", className)}
      {...props}
    />
  );
}

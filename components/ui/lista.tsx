import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Lista de linhas separadas por fio, encostada na borda do painel.
 * Ranking, lançamentos, convites e registro de atividade usam a mesma.
 */
export function Lista({
  className,
  ordenada = false,
  children,
  ...props
}: Omit<React.ComponentProps<"ul">, "ref"> & { ordenada?: boolean }) {
  const classes = cn("flex flex-col divide-y divide-line", className);
  if (ordenada) {
    return (
      <ol className={classes} {...props}>
        {children}
      </ol>
    );
  }
  return (
    <ul className={classes} {...props}>
      {children}
    </ul>
  );
}

export function Linha({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      className={cn("flex min-h-13 items-center gap-3 px-5 py-2.5 text-sm", className)}
      {...props}
    />
  );
}

/** Texto principal e secundário empilhados, que somem com reticências. */
export function LinhaTexto({
  principal,
  secundario,
  riscado = false,
  className,
}: {
  principal: React.ReactNode;
  secundario?: React.ReactNode;
  riscado?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("flex min-w-0 flex-1 flex-col", className)}>
      <span className={cn("truncate font-semibold", riscado && "text-ink-muted line-through")}>
        {principal}
      </span>
      {secundario ? <span className="truncate text-xs text-ink-muted">{secundario}</span> : null}
    </span>
  );
}

/**
 * Posição num ranking. O primeiro leva a marca, os demais do pódio a
 * versão suave, o resto fica neutro.
 */
export function Posicao({ numero }: { numero: number }) {
  return (
    <span
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold",
        numero === 1
          ? "bg-brand text-action-ink"
          : numero <= 3
            ? "bg-brand-soft text-brand-ink"
            : "bg-surface-sunken text-ink-muted",
      )}
    >
      {numero}
    </span>
  );
}

/** Barra proporcional, para comparar pontuação de relance. */
export function Barra({ proporcao, className }: { proporcao: number; className?: string }) {
  const largura = Math.max(0, Math.min(100, Math.round(proporcao * 100)));
  return (
    <span
      className={cn("h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-surface-sunken", className)}
      aria-hidden
    >
      <span className="block h-full rounded-full bg-brand" style={{ width: `${largura}%` }} />
    </span>
  );
}

/** Número em destaque numa linha: pontos, contagem. */
export function Numero({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("w-12 shrink-0 text-right text-md font-semibold", className)}>
      {children}
    </span>
  );
}

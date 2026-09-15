import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Faixa de resumo: números que a pessoa lê antes de decidir o que fazer.
 * Um painel só, dividido por fios, em vez de quatro caixas soltas.
 */
export function FaixaDeResumo({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 overflow-hidden rounded-lg border border-line bg-surface-raised shadow-card lg:grid-cols-4",
        "[&>*]:border-line [&>*:nth-child(odd)]:border-r [&>*:nth-child(-n+2)]:border-b lg:[&>*]:border-b-0 lg:[&>*:not(:last-child)]:border-r",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Indicador({
  rotulo,
  valor,
  detalhe,
  href,
  tom = "neutro",
}: {
  rotulo: string;
  valor: number | string;
  detalhe?: string;
  href?: string;
  tom?: "neutro" | "atencao";
}) {
  const conteudo = (
    <>
      <span className="flex min-h-10 items-start justify-between gap-2 text-sm font-medium text-ink-muted lg:min-h-0">
        {rotulo}
        {href ? (
          <ArrowUpRight
            className="size-4 text-ink-subtle transition-[color,transform] duration-150 group-hover:translate-x-px group-hover:-translate-y-px group-hover:text-brand"
            aria-hidden
          />
        ) : null}
      </span>
      <span
        className={cn(
          "font-display text-3xl font-semibold tracking-tight",
          tom === "atencao" && typeof valor === "number" && valor > 0 && "text-warning-strong",
        )}
      >
        {valor}
      </span>
      {detalhe ? <span className="text-xs text-ink-muted">{detalhe}</span> : null}
    </>
  );

  const classes = "group flex flex-col gap-1 px-5 py-4 outline-none";

  if (href) {
    return (
      <Link href={href} className={cn(classes, "transition-colors hover:bg-surface focus-visible:bg-surface")}>
        {conteudo}
      </Link>
    );
  }
  return <div className={classes}>{conteudo}</div>;
}

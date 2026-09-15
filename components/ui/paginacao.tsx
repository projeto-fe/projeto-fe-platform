import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

/** Anterior/próximo com o número da página. Sem nada pra paginar, não desenha. */
export function Paginacao({
  paginaAtual,
  totalDePaginas,
  criarHref,
}: {
  paginaAtual: number;
  totalDePaginas: number;
  criarHref: (pagina: number) => string;
}) {
  if (totalDePaginas <= 1) return null;

  const classeDoBotao =
    "inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-sm font-semibold text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink";
  const classeDesabilitada = "pointer-events-none opacity-40";

  return (
    <div className="flex items-center justify-between border-t border-line px-5 py-3">
      {paginaAtual > 1 ? (
        <Link href={criarHref(paginaAtual - 1)} className={classeDoBotao}>
          <ChevronLeft className="size-4" aria-hidden />
          Anterior
        </Link>
      ) : (
        <span className={cn(classeDoBotao, classeDesabilitada)}>
          <ChevronLeft className="size-4" aria-hidden />
          Anterior
        </span>
      )}

      <span className="text-xs text-ink-muted">
        Página {paginaAtual} de {totalDePaginas}
      </span>

      {paginaAtual < totalDePaginas ? (
        <Link href={criarHref(paginaAtual + 1)} className={classeDoBotao}>
          Próximo
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : (
        <span className={cn(classeDoBotao, classeDesabilitada)}>
          Próximo
          <ChevronRight className="size-4" aria-hidden />
        </span>
      )}
    </div>
  );
}

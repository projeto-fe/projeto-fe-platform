import type { LucideIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Estado vazio que ensina: o que este lugar vai mostrar e qual é a primeira
 * ação. Nunca "nada aqui".
 */
export function EstadoVazio({
  icone: Icone,
  titulo,
  descricao,
  acao,
  compacto = false,
  className,
}: {
  icone: LucideIcon;
  titulo: string;
  descricao?: string;
  acao?: React.ReactNode;
  compacto?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compacto ? "gap-3 px-5 py-8" : "gap-4 px-6 py-14",
        className,
      )}
    >
      <span
        className={cn(
          "grid place-items-center rounded-full bg-surface-sunken text-ink-subtle",
          compacto ? "size-10 [&>svg]:size-5" : "size-12 [&>svg]:size-6",
        )}
        aria-hidden
      >
        <Icone strokeWidth={1.75} />
      </span>
      <div className="flex max-w-[40ch] flex-col gap-1">
        <p className={cn("font-semibold", compacto ? "text-sm" : "text-md")}>{titulo}</p>
        {descricao ? <p className="text-sm text-ink-muted">{descricao}</p> : null}
      </div>
      {acao ? <div className="flex flex-wrap justify-center gap-2 pt-1">{acao}</div> : null}
    </div>
  );
}

import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/marca/logo";
import { cn } from "@/lib/utils";

type Props = {
  titulo: string;
  /** Uma frase sobre o que a tela faz ou o estado de agora. */
  descricao?: React.ReactNode;
  /** Ação principal da tela. Fica no cabeçalho, não no corpo. */
  acao?: React.ReactNode;
  /** Tela filha: link para voltar à lista de onde veio. */
  voltar?: { href: string; rotulo: string };
};

/**
 * Cabeçalho de página: título grande, uma frase de contexto e a ação
 * principal à direita. Compartilha a largura máxima do corpo.
 */
export function CabecalhoDaPagina({ titulo, descricao, acao, voltar }: Props) {
  return (
    <header className="border-b border-line bg-surface-raised md:bg-transparent md:border-b-0">
      <div className="mx-auto flex w-full max-w-(--content-w) flex-col gap-3 px-4 pt-4 pb-4 md:px-8 md:pt-8 md:pb-2">
        <div className="md:hidden">
          <Logo compacto />
        </div>

        {voltar ? (
          <Link
            href={voltar.href}
            className="inline-flex w-fit items-center gap-1 rounded-md text-sm font-semibold text-ink-muted transition-colors hover:text-ink"
          >
            <ChevronLeft className="size-4" aria-hidden />
            {voltar.rotulo}
          </Link>
        ) : null}

        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">{titulo}</h1>
            {descricao ? <p className="max-w-[64ch] text-sm text-ink-muted">{descricao}</p> : null}
          </div>
          {acao ? <div className="flex shrink-0 flex-wrap items-center gap-2">{acao}</div> : null}
        </div>
      </div>
    </header>
  );
}

export function CorpoDaPagina({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("mx-auto flex w-full max-w-(--content-w) flex-1 flex-col gap-5 px-4 py-5 md:px-8 md:py-6", className)}>
      {children}
    </div>
  );
}

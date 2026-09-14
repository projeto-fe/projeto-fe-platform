import { cn } from "@/lib/utils";

/**
 * O leão do Instituto, mesmo desenho usado no site.
 *
 * Carregado como arquivo e não embutido porque o traçado tem milhares de
 * pontos. Fica como <img> em vez de next/image de propósito: o otimizador de
 * imagem não processa SVG, então só acrescentaria uma volta pelo servidor
 * para entregar exatamente o mesmo arquivo.
 */
function SimboloDaMarca({
  titulo,
  claro,
  className,
}: {
  titulo?: string;
  /** Sobre o navy da marca, usa a versão clara do desenho. */
  claro?: boolean;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={claro ? "/logo-mark-light.svg" : "/logo-mark.svg"}
      alt={titulo ?? ""}
      aria-hidden={titulo ? undefined : true}
      className={className}
    />
  );
}

type Props = {
  /** Sobre o navy da marca (login e ranking público), o texto vira claro. */
  claro?: boolean;
  /** Só o símbolo, sem o nome. */
  compacto?: boolean;
  className?: string;
};

export function Logo({ claro = false, compacto = false, className }: Props) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <SimboloDaMarca
        titulo={compacto ? "Instituto Projeto Fé" : undefined}
        claro={claro}
        className="h-9 w-auto shrink-0"
      />
      {compacto ? null : (
        <span className="leading-none">
          <span
            className={cn(
              "block font-display text-[0.625rem] font-medium tracking-[0.22em]",
              claro ? "text-brand-canvas-ink/70" : "text-ink-muted",
            )}
          >
            INSTITUTO
          </span>
          <span
            className={cn(
              "mt-1 block font-display text-[0.9375rem] font-extrabold tracking-tight",
              claro ? "text-brand-canvas-ink" : "text-ink",
            )}
          >
            PROJETO <span className="text-brand">FÉ</span>
          </span>
        </span>
      )}
    </span>
  );
}

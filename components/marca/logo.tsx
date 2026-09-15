import { cn } from "@/lib/utils";

/**
 * O leão do Instituto: exatamente o mesmo arquivo que o site institucional
 * carrega no header (`lion-mark.svg`). Portal e site precisam abrir com o
 * mesmo desenho, senão parecem dois produtos de duas marcas.
 *
 * É laranja sólido, então dispensa variante clara: funciona sobre o branco do
 * portal e sobre o navy da capa de entrada.
 *
 * Fica como <img> em vez de next/image de propósito: o otimizador de imagem
 * não processa SVG, então só acrescentaria uma volta pelo servidor para
 * entregar exatamente o mesmo arquivo.
 */
export function SimboloDaMarca({
  titulo,
  className,
}: {
  titulo?: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/lion-mark.svg"
      alt={titulo ?? ""}
      aria-hidden={titulo ? undefined : true}
      className={className}
    />
  );
}

type Props = {
  /** Sobre o navy da marca (entrada e ranking público), o texto vira claro. */
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
        className="h-9 w-auto shrink-0"
      />
      {compacto ? null : (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-2xs font-medium tracking-[0.3em]",
              claro ? "text-brand-canvas-ink/70" : "text-ink-muted",
            )}
          >
            INSTITUTO
          </span>
          <span
            className={cn(
              "mt-1 font-display text-md font-extrabold tracking-tight",
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

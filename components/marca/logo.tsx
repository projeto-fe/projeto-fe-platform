import { cn } from "@/lib/utils";

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
      <img
        src="/lion.svg"
        alt={compacto ? "Instituto Projeto Fé" : ""}
        aria-hidden={compacto ? undefined : true}
        className="size-8 shrink-0 rounded-lg"
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

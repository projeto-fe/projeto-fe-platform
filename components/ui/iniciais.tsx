import { cn } from "@/lib/utils";

export function iniciaisDe(nome: string) {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

/**
 * Avatar de iniciais. Não há foto de ninguém no sistema (ver README), então
 * o nome é a identidade visual das pessoas e das crianças.
 */
export function Iniciais({
  nome,
  tamanho = "md",
  tom = "neutro",
  className,
}: {
  nome: string;
  tamanho?: "sm" | "md" | "lg";
  tom?: "neutro" | "inverso" | "marca";
  className?: string;
}) {
  const tamanhos = {
    sm: "size-7 text-2xs",
    md: "size-8 text-xs",
    lg: "size-10 text-sm",
  };
  const tons = {
    neutro: "bg-surface-sunken text-ink-muted",
    inverso: "bg-surface-inverse text-ink-inverse",
    marca: "bg-brand-soft text-brand-ink",
  };
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-semibold",
        tamanhos[tamanho],
        tons[tom],
        className,
      )}
    >
      {iniciaisDe(nome)}
    </span>
  );
}

"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export function iniciaisDe(nome: string) {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

/**
 * Avatar: mostra a foto quando existe, iniciais quando não. Não faz nenhuma
 * consulta para saber se a foto existe: tenta carregar, e se a rota
 * responder 404 (ninguém enviou foto, ou foi removida), cai para iniciais
 * sozinho. Isso evita uma checagem de existência por linha de lista.
 */
export function Iniciais({
  nome,
  foto,
  tamanho = "md",
  tom = "neutro",
  className,
}: {
  nome: string;
  /** Endereço da foto (ex.: `urlDaFoto(caminho)`). Ausente ou nulo mostra iniciais. */
  foto?: string | null;
  tamanho?: "sm" | "md" | "lg";
  tom?: "neutro" | "inverso" | "marca";
  className?: string;
}) {
  const [falhou, setFalhou] = React.useState(false);

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

  if (foto && !falhou) {
    return (
      // Rota própria (/fotos/...), fora do domínio de imagens do next/image.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={foto}
        alt=""
        aria-hidden
        onError={() => setFalhou(true)}
        className={cn("shrink-0 rounded-full object-cover", tamanhos[tamanho], className)}
      />
    );
  }

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

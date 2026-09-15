import * as React from "react";

import { Logo, SimboloDaMarca } from "@/components/marca/logo";

/**
 * Moldura das telas sem sessão (entrar e aceitar convite): a capa navy da
 * marca à esquerda, com o leão em marca d'água, e o formulário à direita.
 * A capa não inverte com o tema de propósito (ver tokens.css).
 */
export function MolduraDeEntrada({
  titulo,
  frase,
  children,
}: {
  titulo: React.ReactNode;
  frase: string;
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-dvh md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:grid-cols-2">
      <section className="relative flex flex-col justify-between gap-10 overflow-hidden bg-brand-canvas px-6 py-7 text-brand-canvas-ink md:px-10 md:py-10">
        <SimboloDaMarca
          className="pointer-events-none absolute -right-24 -bottom-24 h-[28rem] w-auto opacity-[0.07] select-none md:-right-28 md:-bottom-32 md:h-[36rem]"
        />

        <div className="relative">
          <Logo claro />
        </div>

        <div className="relative flex flex-col gap-4">
          <h1 className="max-w-[18ch] font-display text-3xl leading-[1.1] font-semibold tracking-tight text-balance md:text-4xl">
            {titulo}
          </h1>
          <p className="max-w-[38ch] text-base text-brand-canvas-ink/70">{frase}</p>
        </div>

        <p className="relative text-xs text-brand-canvas-ink/50">Instituto Projeto Fé · Marília, SP</p>
      </section>

      <section className="flex items-center justify-center bg-surface px-6 py-10 md:px-10">
        <div className="flex w-full max-w-sm flex-col gap-6">{children}</div>
      </section>
    </main>
  );
}

export function CabecalhoDeEntrada({ titulo, descricao }: { titulo: string; descricao: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h2 className="font-display text-2xl font-semibold tracking-tight">{titulo}</h2>
      <p className="text-sm text-ink-muted">{descricao}</p>
    </div>
  );
}

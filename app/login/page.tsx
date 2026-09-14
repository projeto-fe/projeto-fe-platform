import type { Metadata } from "next";

import { Logo } from "@/components/marca/logo";

import { FormularioDeLogin } from "./formulario";

export const metadata: Metadata = { title: "Entrar" };

export default async function PaginaDeLogin({
  searchParams,
}: {
  searchParams: Promise<{ proximo?: string }>;
}) {
  const { proximo } = await searchParams;

  return (
    <main className="grid min-h-dvh md:grid-cols-2">
      <section className="flex flex-col justify-between gap-7 bg-brand-canvas px-6 py-8 md:px-9 md:py-10">
        <Logo claro />

        <div className="flex flex-col gap-3">
          <h1 className="font-display text-3xl leading-[1.12] font-semibold text-brand-canvas-ink md:text-4xl">
            Cada criança tem um <span className="text-brand">nome</span>, uma história e um
            caminho.
          </h1>
          <p className="max-w-[34ch] text-sm text-brand-canvas-ink/70">
            Portal interno da equipe. Cadastro, acompanhamento e o IDE JOGAI num lugar só.
          </p>
        </div>

        <p className="text-xs text-brand-canvas-ink/50">
          Instituto Projeto Fé · Marília, SP
        </p>
      </section>

      <section className="flex flex-col justify-center gap-5 bg-surface-raised px-6 py-10 md:px-9">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-2xl font-semibold">Entrar</h2>
          <p className="text-sm text-ink-muted">Acesso restrito à equipe do Instituto.</p>
        </div>

        <FormularioDeLogin proximo={proximo} />

        <p className="text-center text-xs text-ink-muted">
          Não tem acesso? Peça um convite à coordenação.
        </p>
      </section>
    </main>
  );
}

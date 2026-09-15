import type { Metadata } from "next";

import { CabecalhoDeEntrada, MolduraDeEntrada } from "@/components/shell/moldura-de-entrada";

import { FormularioDeLogin } from "./formulario";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesso da equipe do Instituto Projeto Fé.",
};

const MOTIVOS: Record<string, string> = {
  "sem-acesso":
    "Sua conta não tem acesso ao portal no momento. Fale com a coordenação para reativar.",
};

export default async function PaginaDeLogin({
  searchParams,
}: {
  searchParams: Promise<{ proximo?: string; motivo?: string }>;
}) {
  const { proximo, motivo } = await searchParams;

  return (
    <MolduraDeEntrada
      titulo={
        <>
          Cada criança tem um <span className="text-brand">nome</span>, uma história e um caminho.
        </>
      }
      frase="Portal interno da equipe. Cadastro, acompanhamento e o IDE JOGAI num lugar só."
    >
      <CabecalhoDeEntrada titulo="Entrar" descricao="Acesso restrito à equipe do Instituto." />

      <FormularioDeLogin proximo={proximo} aviso={motivo ? MOTIVOS[motivo] : undefined} />

      <p className="text-center text-xs text-ink-muted">
        Não tem acesso? Peça um convite à coordenação.
      </p>
    </MolduraDeEntrada>
  );
}
